import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectPageQueryReqDTO } from './dto/project-pageQuery-req.dto';
import { PrismaService } from '@app/prisma';
import { Prisma } from '@prisma/client';
import {
  VsCompileStatusEnum,
  VsProjectStateEnum,
} from '@app/enum/project.enum';
import { Page } from '@app/dto/page.dto';
import { ProjectAddReqDto } from './dto/add-project-req.dto';
import { ProjectQueryReqDTO } from './dto/project-query-req.dto';
import { ProjectUpdateReqDtoDto } from './dto/update-project.dto';
import { NodeService } from '../node/node.service';
import { VsProjectCompileReq } from './dto/VsProjectCompileReq.dto';
import { FlowNodeUtil } from '@app/utils/vs/flow-node.util';
import { VsLink } from '../link/entities/link.entity';
import { VsPort } from '../port/entities/port.entity';
import { VsNode } from '../node/entities/node.entity';
import { VsNodeTaskTypeEnum } from '@app/enum/node.enum';

interface VsCompileResultProp {
  requestCompileTime: Date;
  status: VsCompileStatusEnum;
  msg?: string;
}

interface VsProjectProp {
  compileResult?: VsCompileResultProp;
}
@Injectable()
export class ProjectService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  // 编译任务线程池配置
  private readonly vsCompileTaskSubmitExecutor = new Map<
    string,
    Promise<void>
  >();

  @Inject(NodeService)
  private readonly nodeService: NodeService;
  async pageQuery(req: ProjectPageQueryReqDTO) {
    const { current, size, name } = req;
    // 构建查询条件
    const where: Prisma.t_vs_projectWhereInput = {};
    if (name) {
      where.name = {
        contains: name.trim(),
        // mode: Prisma.QueryMode.insensitive, // 使用正确的枚举类型
      };
    }
    // 执行查询
    const [total, records] = await Promise.all([
      // 获取总数
      this.prismaService.t_vs_project.count({ where }),
      // 获取分页数据
      this.prismaService.t_vs_project.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        skip: (current - 1) * size,
        take: size,
      }),
    ]);
    const respRecords = records.map((record) => ({
      id: record.id,
      name: record.name,
      state: record.state as VsProjectStateEnum,
      description: record.description,
      compileVersion: record.compileVersion,
      properties: record.properties,
      createTime: record.createTime,
      modifyTime: record.modifyTime,
    }));
    // 返回分页结果
    return new Page(current, size, total, respRecords);
  }

  async add(projectAddReqDto: ProjectAddReqDto) {
    const { name, description } = projectAddReqDto;
    const projectExistList = await this.prismaService.t_vs_project.findMany({
      where: {
        name,
      },
    });
    if (projectExistList.length > 0) {
      throw new UnauthorizedException('项目名称已存在');
    }
    const result = await this.prismaService.t_vs_project.create({
      data: {
        name,
        description,
        // - Java中的 VsProject toVsProject() 方法在NestJS中直接在service层处理
        state: VsProjectStateEnum.OFFLINE,
        properties: JSON.stringify({
          compileResult: null,
        }),
      },
    });
    return result;
  }

  async queryByCondition(req: ProjectQueryReqDTO) {
    const { id, name, contextPath, method } = req;
    const where: Prisma.t_vs_projectWhereInput = {};
    if (id) {
      where.id = id;
    }
    if (name) {
      where.name = {
        contains: name.trim(),
      };
    }
    if (contextPath) {
      where.contextPath = {
        contains: contextPath.trim(),
      };
    }
    if (method) {
      where.method = {
        equals: method,
      };
    }
    const list = await this.prismaService.t_vs_project.findMany({
      where,
    });
    return list;
  }

  async modify(projectModifyDto: ProjectUpdateReqDtoDto) {
    await this.prismaService.t_vs_project.update({
      where: {
        id: projectModifyDto.id,
      },
      data: {
        name: projectModifyDto.name,
        description: projectModifyDto.description,
      },
    });
    return true;
  }

  async layerLoad(req: { id: string }) {
    const { id } = req;
    const project = await this.prismaService.t_vs_project.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    return await this.nodeService.list(project.id);
  }
  async compile(req: VsProjectCompileReq): Promise<boolean> {
    const projectId = req.id;

    // 获取项目信息
    const prj = await this.prismaService.t_vs_project.findUnique({
      where: { id: projectId },
    });

    if (!prj) {
      throw new BadRequestException('数据已发生变化,请刷新后重试');
    }

    if (prj.state === VsProjectStateEnum.ONLINE) {
      throw new BadRequestException('项目已上线,请下线后再编译');
    }

    // 先更新为正在编译状态
    const requestCompileTime = new Date();
    const initCompileProp: VsCompileResultProp = {
      requestCompileTime,
      status: VsCompileStatusEnum.COMPILING,
    };
    await this.updateCompileResult(projectId, initCompileProp);

    let submitTaskSuccess = false;
    try {
      // 提交异步编译任务
      const compileTask = this.executeCompileTask(
        projectId,
        requestCompileTime,
        req,
      );
      this.vsCompileTaskSubmitExecutor.set(projectId.toString(), compileTask);
      submitTaskSuccess = true;
    } catch (error) {
      console.error('the compile submit task queue is full', error);
    }

    return submitTaskSuccess;
  }

  private async executeCompileTask(
    projectId: number,
    requestCompileTime: Date,
    req: VsProjectCompileReq,
  ): Promise<void> {
    try {
      const resultProp: VsCompileResultProp = {
        requestCompileTime,
        status: VsCompileStatusEnum.COMPILING,
      };

      // 查询项目相关数据
      let queryData: [any[], any[], any[]];
      let querySuccess = false;

      try {
        // 对于非长时间占用线程的代码，在事务里执行
        queryData = await this.prismaService.$transaction(async (tx) => {
          const links = await tx.t_vs_link.findMany({
            where: { projectId },
            select: {
              id: true,
              sourceId: true,
              targetId: true,
              sourcePort: true,
              targetPort: true,
            },
          });

          const ports = await tx.t_vs_port.findMany({
            where: { projectId },
            select: {
              id: true,
              nodeId: true,
              type: true,
              properties: true,
            },
          });

          const nodes = await tx.t_vs_node.findMany({
            where: { projectId },
            select: {
              id: true,
              properties: true,
              viewType: true,
              taskType: true,
            },
          });

          return [links, ports, nodes];
        });
        querySuccess = true;
      } catch (error) {
        console.error(`failed to query, project id = ${projectId}`, error);
        querySuccess = false;
      }

      // 查询失败,直接返回
      if (!querySuccess) {
        resultProp.status = VsCompileStatusEnum.QUERY_FAILED;
        resultProp.msg = '执行编译任务失败,请重新提交';
        await this.updateCompileResult(projectId, resultProp);
        return;
      }

      // 事务外，执行一些比较耗时的逻辑
      const links: VsLink[] = queryData[0] as VsLink[];
      const ports: VsPort[] = queryData[1] as VsPort[];
      const nodes: VsNode[] = queryData[2] as VsNode[];

      let compileFailed = true;
      let updateRecord: any[] = [];
      try {
        // 做代码编译
        updateRecord = await this.getUpdateRecord(nodes, links, ports);
        compileFailed = false;
      } catch (error) {
        console.error(`compile failed, project id ${projectId}`, error);
        resultProp.status = VsCompileStatusEnum.COMPILE_FAILED;
        resultProp.msg = error.message;
      }

      // 编译失败,更新DB信息,直接返回
      if (compileFailed) {
        await this.updateCompileResult(projectId, resultProp);
        return;
      }

      // 编译成功：需更新项目和节点
      try {
        await this.prismaService.$transaction(async (tx) => {
          // 批量更新节点
          for (const node of updateRecord) {
            await tx.t_vs_node.update({
              where: { id: node.id },
              data: {
                script: node.script,
                classBytes: node.classBytes,
              },
            });
          }

          // 更新工程的编译版本（乐观锁机制）
          const retry = 10;
          let updateSuccess = false;
          for (let i = 0; i < retry; i++) {
            const currentProject = await tx.t_vs_project.findUnique({
              where: { id: req.id },
              select: { compileVersion: true },
            });

            if (!currentProject) {
              throw new Error('Project not found');
            }

            const currentVersion = currentProject.compileVersion;
            try {
              await tx.t_vs_project.updateMany({
                where: {
                  id: req.id,
                  compileVersion: currentVersion,
                },
                data: {
                  compileVersion: currentVersion + 1,
                },
              });
              updateSuccess = true;
              break;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              // 版本冲突，继续重试
              continue;
            }
          }

          if (updateSuccess) {
            resultProp.status = VsCompileStatusEnum.COMPILE_SUCCESS;
            resultProp.msg = '成功';
            await this.updateCompileResult(projectId, resultProp);
          } else {
            console.error(`retry > 10 times for project id ${projectId}`);
            resultProp.status = VsCompileStatusEnum.COMPILE_FAILED;
            resultProp.msg = '他人已更新此项目,请刷新页面并尝试再次提交';
            await this.updateCompileResult(projectId, resultProp);
            throw new Error('Update failed after retries');
          }
        });
      } catch (error) {
        console.error(`Transaction failed for project ${projectId}`, error);
        throw error;
      }
    } finally {
      // 清理任务记录
      this.vsCompileTaskSubmitExecutor.delete(projectId.toString());
    }
  }

  /**
   * 更新编译结果
   */
  private async updateCompileResult(
    projectId: number,
    prop: VsCompileResultProp,
  ): Promise<boolean> {
    // 获取数据库项目属性
    const dbProject = await this.prismaService.t_vs_project.findUnique({
      where: { id: projectId },
      select: { properties: true },
    });

    // 更新部分属性
    let vsProjectProp: VsProjectProp = {};
    if (dbProject?.properties) {
      vsProjectProp = JSON.parse(dbProject.properties as string);
    }
    vsProjectProp.compileResult = prop;

    // 更新数据库
    await this.prismaService.t_vs_project.update({
      where: { id: projectId },
      data: {
        properties: JSON.stringify(vsProjectProp),
      },
    });

    return true;
  }

  /**
   * 获取更新记录（编译核心逻辑）
   */
  private async getUpdateRecord(
    nodes: VsNode[],
    links: VsLink[],
    ports: VsPort[],
  ): Promise<any[]> {
    // key: node id, value: node name
    const nodeId2NodeName = new Map<string, string>();
    for (const node of nodes) {
      const nodeProp = JSON.parse(node.properties);
      nodeId2NodeName.set(node.id, nodeProp.name);
    }

    // create the actual execute flow
    // key: link start node id, value: link
    const sourcePort2Link = new Map<string, VsLink>();
    for (const link of links) {
      sourcePort2Link.set(link.sourcePort, link);
    }

    // key: port id, value: port
    const portId2Port = new Map<string, VsPort>();
    for (const port of ports) {
      portId2Port.set(port.id, port);
    }

    // key: node id, value: node
    const nodeId2node = new Map<string, VsNode>();
    for (const node of nodes) {
      nodeId2node.set(node.id, node);
    }

    // key: end node(only atomic end node) id, value: node
    const endNodeId2node = new Map<string, any>();
    for (const node of nodes) {
      if (node.taskType === VsNodeTaskTypeEnum.END) {
        endNodeId2node.set(node.id, node);
      }
    }

    this.validateAtomicEndNodes(endNodeId2node);

    // only contains atomic node
    const atomicNodes = FlowNodeUtil.getActualNodes(nodes);

    // 获取字节码
    // only get atomic node's output ports, for generate node script and compile node script
    const actualOutputPorts = FlowNodeUtil.getActualOutputPorts(
      ports,
      nodeId2node,
      endNodeId2node,
    );

    // only contains actual execute link
    const actualLinks = FlowNodeUtil.getActualLinks(
      links,
      nodeId2node,
      portId2Port,
      sourcePort2Link,
      nodeId2NodeName,
    );

    const nodeId2Script = FlowNodeUtil.makeNodeTaskScript(
      actualLinks,
      actualOutputPorts,
      atomicNodes,
      nodeId2NodeName,
    );

    const nodeId2ClassBytes = FlowNodeUtil.compileNodeTaskScript(
      nodeId2Script,
      nodeId2NodeName,
    );

    // 更新节点脚本对应的字节码
    const updateRecord: any[] = [];
    for (const [nodeId, classBytes] of Object.entries(nodeId2ClassBytes)) {
      const script = nodeId2Script[nodeId];

      if (!script || !classBytes || (classBytes as any).length === 0) {
        console.error(
          `current node ${nodeId} script = ${script}, classBytes = ${classBytes}`,
        );
        throw new BadRequestException(
          `节点[${nodeId2NodeName.get(nodeId)}]的脚本或字节码为空`,
        );
      }

      const vsNode = {
        id: nodeId,
        script: script,
        classBytes: classBytes,
      };
      updateRecord.push(vsNode);
    }

    return updateRecord;
  }
  /**
   * 验证原子结束节点
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private validateAtomicEndNodes(endNodeId2node: Map<string, any>): void {
    // 这里需要你补充具体的验证逻辑
    // 原Java代码中应该有相应的验证方法
  }
}
