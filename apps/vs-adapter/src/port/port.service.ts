import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AddPortDto } from './dto/add-port.dto';
import { VsHttpMethodEnum, VsPortTypeEnum } from '@app/enum/port.enum';
import { PrismaService } from '@app/prisma';
import { VsNodeTaskTypeEnum } from '@app/enum//node.enum';
import { UpdatePortDto } from './dto/update-port.dto';
import { VsPortProp } from './dto/VsPortProp';
import {
  VsPortRouteMetaDataTypeEnum,
  VsPortRouteMetaDataTypeValidator,
  VsPortRouteMetaOpTypeOperator,
  VsPortRouteMetaSourceTypeExpression,
} from '@app/enum/port.route.enum';
import { FlowNodeUtil } from '@app/utils/vs/flow-node.util';
import { VsPortDetailQueryReq } from './dto/VsPortDetailQueryReq.dto';

@Injectable()
export class PortService {
  create(createPortDto: AddPortDto) {
    return 'This action adds a new port' + createPortDto;
  }
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async add(req: AddPortDto) {
    // 检查nodeId下是否已经存在一个输入节点
    if (req.type === VsPortTypeEnum.INPUT_PORT) {
      const count = await this.prismaService.t_vs_port.count({
        where: {
          nodeId: req.nodeId,
          type: VsPortTypeEnum.INPUT_PORT,
        },
      });
      if (count > 0) {
        throw new BadRequestException(
          `节点ID=${req.nodeId}下存在输入端口,请检查`,
        );
      }
    }
    const node = await this.prismaService.t_vs_node.findUnique({
      where: {
        id: req.nodeId,
      },
      select: {
        id: true,
        taskType: true,
        viewType: true,
        projectId: true,
      },
    });
    this.checkCompositeNormalNodeOutputPortNameLength(
      req.properties.name,
      node.taskType as VsNodeTaskTypeEnum,
      req.type,
    );
    // start node only exist output port, no input port
    if (node.taskType === VsNodeTaskTypeEnum.CONTEXT) {
      if (req.type === VsPortTypeEnum.INPUT_PORT) {
        throw new BadRequestException(`起始节点只能存在输出端口,请检查`);
      }
    }
    // end node only exist input port, no output port
    if (
      node.taskType === VsNodeTaskTypeEnum.END ||
      node.viewType === VsNodeTaskTypeEnum.COMPOSITE_END
    ) {
      if (req.type === VsPortTypeEnum.OUTPUT_PORT) {
        throw new BadRequestException(`结束节点只能存在输入端口,请检查`);
      }
    }
    // check node output port limit
    // COMPOSITE_NORMAL & ROUTE can have more than one output ports
    if (
      node.taskType === VsNodeTaskTypeEnum.CONTEXT ||
      node.taskType === VsNodeTaskTypeEnum.HTTP ||
      node.taskType === VsNodeTaskTypeEnum.DATA_MAPPING
    ) {
      const count = await this.prismaService.t_vs_port.count({
        where: {
          nodeId: req.nodeId,
          type: VsPortTypeEnum.OUTPUT_PORT,
        },
      });
      if (count >= 1) {
        throw new BadRequestException(
          `${node.taskType}节点ID=${req.nodeId}下存在多个输出端口,请检查`,
        );
      }
    }
    await this.prismaService.t_vs_port.create({
      data: {
        ...req.toVsPort(),
        projectId: node.projectId,
      },
    });
    const updateReq = new UpdatePortDto();
    updateReq.id = req.id;
    updateReq.properties = req.properties;
    await this.modify(updateReq);
    return 'success';
  }

  checkCompositeNormalNodeOutputPortNameLength(
    portName: string,
    taskType: VsNodeTaskTypeEnum,
    portType: VsPortTypeEnum,
  ) {
    if (
      taskType === VsNodeTaskTypeEnum.COMPOSITE_NORMAL &&
      portType === VsPortTypeEnum.OUTPUT_PORT
    ) {
      if (portName.length > 10) {
        throw new BadRequestException(`复合节点输出端口名称不能超过10个字符`);
      }
    }
  }

  async modify(req: UpdatePortDto) {
    const reqProp = req.properties;
    // 当为http/context组件时 更新属性
    this.setPropWhenContextHttpComponent(reqProp);

    const portId = req.id;
    // 其实没有必要从db里面取，直接从req里获取数据就行了，这里这样做是有历史原因的，应该优化一下
    const dbPort = await this.prismaService.t_vs_port.findUnique({
      where: {
        id: portId,
      },
      select: {
        projectId: true,
        nodeId: true,
        type: true,
      },
    });
    const nodeId = dbPort.nodeId;
    const projectId = dbPort.projectId;
    const vsPortType = dbPort.type as VsPortTypeEnum;
    const vsNode = await this.prismaService.t_vs_node.findUnique({
      where: {
        id: nodeId,
      },
      select: {
        id: true,
        taskType: true,
        viewType: true,
      },
    });

    const nodeTaskType = vsNode.taskType as VsNodeTaskTypeEnum;
    // 普通复合组件输出端口,长度单独限制在10以内
    this.checkCompositeNormalNodeOutputPortNameLength(
      reqProp.name,
      nodeTaskType,
      vsPortType,
    );

    let script = null;
    const propScript = reqProp.script;

    // only OUTPUT type can have script(end node except!)
    if (vsPortType === VsPortTypeEnum.OUTPUT_PORT) {
      // 这个代码有历史原因，不必纠结
      if (propScript !== undefined && propScript !== '') {
        script = propScript;
      } else {
        if (
          nodeTaskType === VsNodeTaskTypeEnum.COMPOSITE_NORMAL ||
          nodeTaskType === VsNodeTaskTypeEnum.COMPOSITE_END
        ) {
          // 复合组件(无额外的执行逻辑)
          script = '';
        } else if (nodeTaskType === VsNodeTaskTypeEnum.CONTEXT) {
          // CONTEXT组件
          // 只能用于注册上下文路径,作为项目的开始,CONTEXT组件无额外的执行逻辑
          script = '';
          const context = reqProp.context;
          if (context === undefined) {
            throw new BadRequestException(`context属性为空,端口ID=${portId}`);
          }
          const path = context.path;

          if (path !== undefined && path !== '') {
            // 检查context path是否重复
            const otherProjects =
              await this.prismaService.t_vs_project.findMany({
                where: {
                  contextPath: path,
                  id: {
                    not: projectId,
                  },
                },
                select: {
                  name: true,
                },
              });
            const count = otherProjects.length;
            if (count > 0) {
              const names = otherProjects
                .map((project) => project.name)
                .join(',');
              throw new BadRequestException(
                `已有项目[${names}]使用了该路径，请调整`,
              );
            }

            const method = context.method;
            // 更新项目的属性
            await this.prismaService.t_vs_project.update({
              where: {
                id: projectId,
              },
              data: {
                method: method,
                contextPath: path,
              },
            });
          } else {
            console.error(
              `path prop can NOT be empty, portId = ${portId}, nodeId = ${vsNode.id}, taskType = ${vsNode.taskType}`,
            );
            throw new BadRequestException(
              `路径属性不能为空,端口ID=${portId},节点ID=${vsNode.id},任务类型=${vsNode.taskType}`,
            );
          }
        } else if (nodeTaskType === VsNodeTaskTypeEnum.ROUTE) {
          // 路由组件
          script = this.generatePortScriptWhenRouteTaskType(
            portId,
            reqProp,
            nodeId,
          );
        } else if (nodeTaskType === VsNodeTaskTypeEnum.HTTP) {
          // HTTP组件
          script = this.generatePortScriptWhenHttpTaskType(
            portId,
            reqProp,
            nodeId,
          );
        } else if (nodeTaskType === VsNodeTaskTypeEnum.CONVERT) {
          // 纯脚本组件
          script = this.generatePortScriptWhenConvertTaskType(
            portId,
            reqProp,
            nodeId,
          );
        } else if (nodeTaskType === VsNodeTaskTypeEnum.DATA_MAPPING) {
          // 数据映射组件
          script = this.generatePortScriptWhenRouteTaskType(
            portId,
            reqProp,
            nodeId,
          );
        } else {
          console.error(
            `unsupported task type, portId = ${portId}, nodeId = ${vsNode.id}, taskType = ${vsNode.taskType}`,
          );
          throw new BadRequestException(
            `不支持的任务类型,端口ID=${portId},节点ID=${vsNode.id},任务类型=${vsNode.taskType},端口类型=${vsPortType}`,
          );
        }
      }
    } else if (vsPortType === VsPortTypeEnum.INPUT_PORT) {
      if (propScript !== undefined && propScript !== '') {
        script = propScript;
      } else {
        if (nodeTaskType === VsNodeTaskTypeEnum.END) {
          // 结束组件
          script = this.generatePortScriptWhenEndTaskType(
            portId,
            reqProp,
            nodeId,
          );
          console.log(script);
        } else {
          console.error(
            `unsupported task type with input port, portId = ${portId}, nodeId = ${vsNode.id}, taskType = ${vsNode.taskType}`,
          );
          throw new BadRequestException(
            `不支持的任务类型,端口ID=${portId},节点ID=${vsNode.id},任务类型=${vsNode.taskType},端口类型=${vsPortType}`,
          );
        }
      }
    } else {
      console.error(
        `unsupported port type, portId = ${portId}, Type = ${vsPortType}`,
      );
      throw new BadRequestException(
        `不支持的端口类型,端口ID=${portId},端口类型=${vsPortType}`,
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPropWhenContextHttpComponent(vsportProp: VsPortProp) {
    // TODO
    // 前端最新版本里，http/context传过来的是一个id，后端在当前方法里将id换为接口的url等属性
    // 但当前版本不打算做这么复杂的修改，先保留
    // set context component prop
    //   if (vsPortProp.getContext() != null) {
    //     VsStandardApi vsStandardApi = vsStandardApiService.getOne(new LambdaQueryWrapper<VsStandardApi>()
    //             .eq(VsStandardApi::getId, vsPortProp.getContext().getContextCompApiId())
    //             .select(VsStandardApi::getPath, VsStandardApi::getMethod));
    //     if (vsStandardApi == null) {
    //         throw new AdminException("数据已更新,请刷新后重试");
    //     }
    //     VsPortPropContext contextProp = vsPortProp.getContext();
    //     contextProp.setMethod(vsStandardApi.getMethod());
    //     contextProp.setPath(vsStandardApi.getPath());
    //     vsPortProp.setContext(contextProp);
    // }
    // // set http component prop
    // if (vsPortProp.getHttp() != null) {
    //     VsTargetApi vsTargetApi = vsTargetApiService.getOne(new LambdaQueryWrapper<VsTargetApi>()
    //             .eq(VsTargetApi::getId, vsPortProp.getHttp().getHttpCompApiId())
    //             .select(VsTargetApi::getUrl, VsTargetApi::getMethod));
    //     if (vsTargetApi == null) {
    //         throw new AdminException("数据已更新,请刷新后重试");
    //     }
    //     VsPortPropHttp httpProp = vsPortProp.getHttp();
    //     httpProp.setUrl(vsTargetApi.getUrl());
    //     httpProp.setMethod(vsTargetApi.getMethod());
    //     // pathParams is set by frontend
    // }
  }
  /**
   * 路由组件-bool条件表达式脚本生成
   */
  generatePortScriptWhenRouteTaskType(
    portId: string,
    reqProp: VsPortProp,
    nodeId: string,
  ): string {
    const cond = reqProp.route;
    if (!cond) {
      throw new BadRequestException(
        `route属性为空,端口ID=${portId},节点ID=${nodeId}`,
      );
    }

    const metas = cond.meta;
    // 一个node上有多个port，每个port上有一个条件表达式。但现在meta设计成数组是不合理的，有历史原因 ，需要优化
    if (!metas || metas.length !== 1) {
      console.error(`does not support multi expression, portId = ${portId}`);
      throw new Error(
        `暂时不支持多个条件表达式,端口ID=${portId},节点ID=${nodeId}`,
      );
    }

    // only support one condition
    const curMeta = metas[0];

    const sourceType = curMeta.source;
    const key = curMeta.key;
    const dataType = curMeta.dataType;
    const op = curMeta.op;
    const rightValueExp = curMeta.rightValue;

    // 验证数据类型
    VsPortRouteMetaDataTypeValidator.validateAndThrowException(
      curMeta.rightValue,
      dataType,
      nodeId,
    );

    if (!key || !rightValueExp) {
      console.error(
        `does not support null key or null rightValue, portId = ${portId}, key = ${key}, rightValue = ${rightValueExp}`,
      );
      throw new Error(
        `暂时不支持空属性,端口ID=${portId},节点ID=${nodeId},key=${key},rightValue=${rightValueExp}`,
      );
    }
    // 这个表达式会被用于生成条件判断代码，用于路由逻辑的实现，比如检查请求头或请求参数是否满足特定条件
    // 例如，如果sourceType是REQ_HEADER，key是"Content-Type"，那么生成的leftValueExp将是： "this.getRequestHeader()['Content-Type']"
    const sourceData = VsPortRouteMetaSourceTypeExpression[sourceType];
    const leftValueExp = `${sourceData}['${key}']`;

    let exp: string;
    const operator = VsPortRouteMetaOpTypeOperator[op];

    if (dataType === VsPortRouteMetaDataTypeEnum.INTEGER) {
      exp = FlowNodeUtil.generateRouteLongCompareSourceCode(
        leftValueExp,
        operator,
        rightValueExp,
      );
    } else if (dataType === VsPortRouteMetaDataTypeEnum.DOUBLE) {
      exp = FlowNodeUtil.generateRouteDoubleCompareSourceCode(
        leftValueExp,
        operator,
        rightValueExp,
      );
    } else if (dataType === VsPortRouteMetaDataTypeEnum.DATETIME) {
      exp = FlowNodeUtil.generateRouteDatetimeCompareSourceCode(
        leftValueExp,
        operator,
        rightValueExp,
      );
    } else if (dataType === VsPortRouteMetaDataTypeEnum.STRING) {
      exp = FlowNodeUtil.generateRouteStringCompareSourceCode(
        leftValueExp,
        operator,
        rightValueExp,
      );
    } else {
      console.error(
        `unsupported dataType, portId = ${portId}, opType = ${dataType}`,
      );
      throw new Error(
        `不支持的数据类型,端口ID=${portId},节点ID=${nodeId},数据类型=${dataType}`,
      );
    }

    return exp;
  }
  generatePortScriptWhenConvertTaskType(
    portId: string,
    reqProp: VsPortProp,
    nodeId: string,
  ) {
    const script = reqProp.script;
    if (!script) {
      throw new BadRequestException(`portId = ${portId}, nodeId=${nodeId}`);
    }
    return script;
  }
  generatePortScriptWhenEndTaskType(
    portId: string,
    reqProp: VsPortProp,
    nodeId: string,
  ) {
    const script = reqProp.script;
    if (!script) {
      throw new BadRequestException(`portId = ${portId}, nodeId=${nodeId}`);
    }
    return script;
  }
  generatePortScriptWhenHttpTaskType(
    portId: string,
    reqProp: VsPortProp,
    nodeId: string,
  ): string {
    const http = reqProp.http;
    if (!http) {
      throw new BadRequestException(
        `http属性为空,端口ID=${portId},节点ID=${nodeId}`,
      );
    }
    const method = http.method as VsHttpMethodEnum | string;
    const url = http.url;
    const requestTimeout = http.requestTimeout;
    if (url === undefined || url === '' || requestTimeout === undefined) {
      throw new BadRequestException(
        `url或requestTimeout属性为空,端口ID=${portId},节点ID=${nodeId}`,
      );
    }
    if (method === undefined || method === '') {
      throw new BadRequestException(
        `method属性为空,端口ID=${portId},节点ID=${nodeId}`,
      );
    }

    const pathParams = http.pathParams;
    if (pathParams.length > 0) {
      const changeStatements = [];
      for (let i = 0; i < pathParams.length; i++) {
        const name = pathParams[i].name;
        const defaultValue = pathParams[i].defaultValue;
        const replaceStatement = FlowNodeUtil.generatePathReplaceStatement(
          name,
          defaultValue,
        );
        changeStatements.push(replaceStatement);
      }
      const changeUrlWhenPathVariableMethodBody = changeStatements.join('\n');
      const additionDefine = FlowNodeUtil.generatePathReplaceMethodDefine(
        changeUrlWhenPathVariableMethodBody,
      );
      // 生成如下代码：
      //   private void changeUrlWhenPathVariable() {
      // url.replace('{userId}', (this.requestParams['userId'] || defaultValue));
      // return url
      //   }
      reqProp.additionDefine = additionDefine;
    } else {
      reqProp.additionDefine = FlowNodeUtil.generatePathReplaceMethodDefine('');
    }
    // HTTP请求响应代码生成
    let execScript;
    if (method === VsHttpMethodEnum.GET) {
      execScript = FlowNodeUtil.generateNodeHttpTaskGetScriptSourceCode(
        url,
        requestTimeout,
      );
    } else if (method === VsHttpMethodEnum.POST) {
      execScript = FlowNodeUtil.generateNodeHttpTaskPostScriptSourceCode(
        url,
        requestTimeout,
      );
    } else {
      throw new BadRequestException(
        `不支持的HTTP方法,端口ID=${portId},节点ID=${nodeId},方法=${method}`,
      );
    }
    return execScript;
  }
  async detailQuery(req: VsPortDetailQueryReq) {
    const vsPort = await this.prismaService.t_vs_port.findUnique({
      where: {
        id: req.id,
      },
    });
    return {
      id: vsPort.id,
      projectId: vsPort.projectId,
      nodeId: vsPort.nodeId,
      type: vsPort.type,
      sourceApiType: vsPort.sourceApiType,
      targetApiType: vsPort.targetApiType,
      sourceApiId: vsPort.sourceApiId,
      targetApiId: vsPort.targetApiId,
      properties: vsPort.properties,
    };
  }
}
