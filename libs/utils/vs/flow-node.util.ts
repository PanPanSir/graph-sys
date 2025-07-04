/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as vm from 'vm';
import { FlowNodeTask } from './flow-node-task';
import { VsNodeViewTypeEnum, VsNodeTaskTypeEnum } from '@app/enum/node.enum';
import { Flow } from './flow';
import { FlowNode } from './flow-node';
import { FlowLink } from './flow-link';
import { VsHttpMethodEnum, VsPortTypeEnum } from '@app/enum/port.enum';
import { VsExecFlow } from './Vs-exec-flow';
import { VsLink } from 'apps/vs-adapter/src/link/entities/link.entity';
import { VsNode } from 'apps/vs-adapter/src/node/entities/node.entity';
import { VsPort } from 'apps/vs-adapter/src/port/entities/port.entity';
import * as ts from 'typescript';

/**
 * 路由元数据源类型枚举
 * 对应Java中的VsPortRouteMetaSourceTypeEnum
 */
export enum RouteMetaSourceType {
  REQ_HEADER = 'REQ_HEADER', // 请求头
  REQ_PARAM = 'REQ_PARAM', // 请求参数
}

// 编译结果接口（替代Java的byte[]）
export interface CompiledScript {
  nodeId: string;
  compiledCode: string; // 编译后的JavaScript代码
  sourceMap?: string; // 可选的源码映射
}
/**
 * 执行上下文接口
 * 对应Java中的VsExecContext
 */
export interface ExecContext {
  requestId: string;
  userId?: string;
  timestamp: number;
  [key: string]: any;
}

/**
 * 数据一致性异常类
 * 对应Java中的VsDataConsistencyException
 */
export class DataConsistencyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataConsistencyException';
  }
}

/**
 * 脚本编译异常类
 * 对应Java中的ScriptCompileException
 */
export class ScriptCompileException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScriptCompileException';
  }
}

/**
 * 流程节点工具类
 * 对应Java中的FlowNodeUtil类，包含所有功能的完整实现
 */
@Injectable()
export class FlowNodeUtil {
  private readonly logger = new Logger(FlowNodeUtil.name);

  // ==================== 常量定义 ====================

  /**
   * 请求头表达式模板
   * 对应Java中的EXP_REQ_HEADER
   */
  public static readonly EXP_REQ_HEADER = 'this.getReqHeader("%s", "%s")';

  /**
   * 请求参数表达式模板
   * 对应Java中的EXP_REQ_PARAM
   */
  public static readonly EXP_REQ_PARAM = 'this.getReqParam("%s", "%s")';

  /**
   * JSON转换方法名
   * 对应Java中的CONVERT_JSON_METHOD_NAME
   */
  public static readonly CONVERT_JSON_METHOD_NAME = 'convertToJson';

  /**
   * 最大执行深度
   * 对应Java中的MAX_DEPTH
   */
  public static readonly MAX_DEPTH = 10000;

  /**
   * 节点ID映射键
   */
  public static readonly START_NODE_ID_KEY = 'START_NODE_ID';
  public static readonly END_NODE_ID_KEY = 'END_NODE_ID';
  public static readonly ALL_VALID_NODE_ID_KEY = 'ALL_VALID_NODE_ID';

  // ==================== 代码模板定义 ====================

  /**
   * 数据转换模板
   * 对应Java中的DATA_CONV_TEMPLATE
   */
  private static readonly DATA_CONV_TEMPLATE = `
    // 数据转换逻辑
    const sourceData = %s;
    const convertedData = this.convertToJson(sourceData);
    this.outputRequestBody = convertedData;
  `;

  /**
   * 路由双精度比较模板
   * 对应Java中的ROUTE_DOUBLE_CMP_TEMPLATE
   */
  private static readonly ROUTE_DOUBLE_CMP_TEMPLATE = `
    // 双精度数值比较
    const leftValue = parseFloat(%s) || 0;
    const rightValue = parseFloat(%s) || 0;
    return leftValue %s rightValue;
  `;

  /**
   * 路由长整型比较模板
   * 对应Java中的ROUTE_LONG_CMP_TEMPLATE
   */
  private static readonly ROUTE_LONG_CMP_TEMPLATE = `
    // 长整型数值比较
    const leftValue = parseInt(%s) || 0;
    const rightValue = parseInt(%s) || 0;
    return leftValue %s rightValue;
  `;

  /**
   * 路由字符串比较模板
   * 对应Java中的ROUTE_STRING_CMP_TEMPLATE
   */
  private static readonly ROUTE_STRING_CMP_TEMPLATE = `
    // 字符串比较
    const leftValue = String(%s || '');
    const rightValue = String(%s || '');
    return leftValue %s rightValue;
  `;

  /**
   * 路由日期时间比较模板
   * 对应Java中的ROUTE_DATETIME_CMP_TEMPLATE
   */
  private static readonly ROUTE_DATETIME_CMP_TEMPLATE = `
    // 日期时间比较
    const leftValue = new Date(%s || 0).getTime();
    const rightValue = new Date(%s || 0).getTime();
    return leftValue %s rightValue;
  `;

  /**
   * 请求头删除模板
   * 对应Java中的REQ_HEADER_DEL_TEMPLATE
   */
  private static readonly REQ_HEADER_DEL_TEMPLATE = `
    // 删除请求头
    this.deleteReqHeader('%s');
  `;

  /**
   * 请求头设置模板
   * 对应Java中的REQ_HEADER_SET_TEMPLATE
   */
  private static readonly REQ_HEADER_SET_TEMPLATE = `
    // 设置请求头
    this.setReqHeader('%s', %s);
  `;

  /**
   * 响应头删除模板
   * 对应Java中的RSP_HEADER_DEL_TEMPLATE
   */
  private static readonly RSP_HEADER_DEL_TEMPLATE = `
    // 删除响应头
    this.deleteRspHeader('%s');
  `;

  /**
   * 响应头设置模板
   * 对应Java中的RSP_HEADER_SET_TEMPLATE
   */
  private static readonly RSP_HEADER_SET_TEMPLATE = `
    // 设置响应头
    this.setRspHeader('%s', %s);
  `;

  /**
   * 多端口布尔方法模板
   * 对应Java中的MULTI_PORT_BOOL_METHOD_TEMPLATE
   */
  private static readonly MULTI_PORT_BOOL_METHOD_TEMPLATE = `
    // 端口条件判断方法
    private %s(): boolean {
      %s
    }
  `;

  /**
   * 多端口调用方法模板
   * 对应Java中的MULTI_PORT_CALL_METHOD_TEMPLATE
   */
  private static readonly MULTI_PORT_CALL_METHOD_TEMPLATE = `
    // 端口调用方法
    // methodName为portId，
    // setActivatedNodeId的值为当前link的endNodeId
    if (this.%s()) {
      this.setActivatedNodeId('%s');
      return;
    }
  `;

  /**
   * HTTP路径变量表达式模板
   * 对应Java中的NODE_HTTP_PATH_VAL_EXP_TEMPLATE
   */
  private static readonly NODE_HTTP_PATH_VAL_EXP_TEMPLATE = `
    // 获取路径变量值
    (this.requestParams['%s'] || %s)
  `;

  /**
   * HTTP路径替换模板
   * 对应Java中的NODE_HTTP_PATH_REPLACE_TEMPLATE
   */
  private static readonly NODE_HTTP_PATH_REPLACE_TEMPLATE = `
    // 替换路径变量
    url = url.replace('%s', %s);
  `;

  /**
   * HTTP路径替换方法模板
   * 对应Java中的NODE_HTTP_PATH_REPLACE_METHOD_TEMPLATE
   */
  private static readonly NODE_HTTP_PATH_REPLACE_METHOD_TEMPLATE = `
    // 路径变量替换方法
    private changeUrlWhenPathVariable(url: string): string {
      %s
      return url;
    }
  `;

  /**
   * HTTP GET请求执行模板
   * 对应Java中的NODE_HTTP_TASK_GET_EXEC_TEMPLATE
   */
  private static readonly NODE_HTTP_TASK_GET_EXEC_TEMPLATE = `
         try {
          // 执行异步POST请求
          const response: AxiosResponse = await AsyncHttpConnPoolUtil.doGet(
            urlWithParams,
            5000,
            headerMap,
          );

          const responseCode = response.status;
          const responseData = response.data;

          // 检查响应状态
          if (responseCode !== 200 || responseData == null) {
            throw new Error(\`状态码=\${responseCode},响应体=\${responseData}\`);
          }

          // 设置响应体
          this.setOutputResponseBody(
            typeof responseData === 'string'
              ? responseData
              : JSON.stringify(responseData),
          );
        } catch (error) {
          this.logger.error(
            \`failed to request \${urlWithParams}, nodeId = \${this.getNodeId()}\`,
            error,
          );
          throw new ServiceUnavailableException(
            \`请求节点[\${this.getNodeName()}]失败,URL=\${urlWithParams},msg=\${error.message}\`,
          );
        }
      };

      // 执行请求（带熔断器支持）
      const circuitBreaker = this.circuitBreaker;
      if (circuitBreaker) {
        try {
          // 使用熔断器执行请求
          //           - HTTP请求只有在熔断器允许的情况下才会执行
          // - 资源节省 : 熔断状态下不会浪费网络资源和时间
          // - 快速失败 : 熔断状态下立即返回错误，不需要等待超时
          await circuitBreaker.fire(runnable);
        } catch (error) {
          // 检查是否是熔断器异常
          if (
            error.name === 'OpenCircuitError' ||
            error.message.includes('circuit')
          ) {
            this.logger.error(
              \`failed to request \${urlWithParams}, nodeId = \${this.getNodeId()}, because it is in FUSED state\`,
              error,
            );
            throw new ServiceUnavailableException(
              \`请求节点[\${this.getNodeName()}]失败,URL=\${urlWithParams},msg=接口已熔断\`,
            );
          }
          throw error;
        }
      } else {
        // 直接执行请求
        await runnable();
      }
    } catch (error) {
      throw new ServiceUnavailableException(
        \`请求节点[\${this.getNodeName()}]失败,msg=\${error.message}\`,
      );
    }
  `;
  /**
   * HTTP POST请求执行模板
   * 对应Java中的NODE_HTTP_TASK_POST_EXEC_TEMPLATE
   */
  private static readonly NODE_HTTP_TASK_POST_EXEC_TEMPLATE =
    '         try {\n' +
    '          // 执行异步POST请求\n' +
    '          const response: AxiosResponse = await AsyncHttpConnPoolUtil.doPost(\n' +
    '            urlWithParams,\n' +
    '            5000,\n' +
    '            headerMap,\n' +
    '          );\n' +
    '\n' +
    '          const responseCode = response.status;\n' +
    '          const responseData = response.data;\n' +
    '\n' +
    '          // 检查响应状态\n' +
    '          if (responseCode !== 200 || responseData == null) {\n' +
    '            throw new Error(`状态码=${responseCode},响应体=${responseData}`);\n' +
    '          }\n' +
    '\n' +
    '          // 设置响应体\n' +
    '          this.setOutputResponseBody(\n' +
    "            typeof responseData === 'string'\n" +
    '              ? responseData\n' +
    '              : JSON.stringify(responseData),\n' +
    '          );\n' +
    '        } catch (error) {\n' +
    '          this.logger.error(\n' +
    '            `failed to request ${urlWithParams}, nodeId = ${this.getNodeId()}`,\n' +
    '            error,\n' +
    '          );\n' +
    '          throw new ServiceUnavailableException(\n' +
    '            `请求节点[${this.getNodeName()}]失败,URL=${urlWithParams},msg=${error.message}`,\n' +
    '          );\n' +
    '        }\n' +
    '      };\n' +
    '\n' +
    '      // 执行请求（带熔断器支持）\n' +
    '      const circuitBreaker = this.circuitBreaker;\n' +
    '      if (circuitBreaker) {\n' +
    '        try {\n' +
    '          // 使用熔断器执行请求\n' +
    '          //           - HTTP请求只有在熔断器允许的情况下才会执行\n' +
    '          // - 资源节省 : 熔断状态下不会浪费网络资源和时间\n' +
    '          // - 快速失败 : 熔断状态下立即返回错误，不需要等待超时\n' +
    '          await circuitBreaker.fire(runnable);\n' +
    '        } catch (error) {\n' +
    '          // 检查是否是熔断器异常\n' +
    '          if (\n' +
    "            error.name === 'OpenCircuitError' ||\n" +
    "            error.message.includes('circuit')\n" +
    '          ) {\n' +
    '            this.logger.error(\n' +
    '              `failed to request ${urlWithParams}, nodeId = ${this.getNodeId()}, because it is in FUSED state`,\n' +
    '              error,\n' +
    '            );\n' +
    '            throw new ServiceUnavailableException(\n' +
    '              `请求节点[${this.getNodeName()}]失败,URL=${urlWithParams},msg=接口已熔断`,\n' +
    '            );\n' +
    '          }\n' +
    '          throw error;\n' +
    '        }\n' +
    '      } else {\n' +
    '        // 直接执行请求\n' +
    '        await runnable();\n' +
    '      }\n' +
    '    } catch (error) {\n' +
    '      throw new ServiceUnavailableException(\n' +
    '        `请求节点[${this.getNodeName()}]失败,msg=${error.message}`,\n' +
    '      );\n' +
    '    }\n';
  /**
   * 单输出调用方法模板
   * 对应Java中的SINGLE_OUTPUT_CALL_METHOD_TEMPLATE
   */
  // super.call()继承父类FlowNodeTask，但单输出端口的情况，node中的脚本无需做当前activenode等逻辑的重写
  // 但MULTI_PORT_CALL_METHOD_TEMPLATE的多输出端口node就不做简单FlowNodeTask的继承了，需要根据实际情况重写
  private static readonly SINGLE_OUTPUT_CALL_METHOD_TEMPLATE = `
    super.call();
    %s
  `;

  /**
   * 默认调用方法体
   * 对应Java中的DEFAULT_CALL_METHOD_SET_BODY
   * 都是flowNodeTask中定义的，执行的时候会用到
   */
  // // previous node output** as current node input**
  // private transient String inputRequestBody;
  // private transient String inputResponseBody;
  // // current node output** as next node input**
  // private transient String outputRequestBody;
  // private transient String outputResponseBody;
  private static readonly DEFAULT_CALL_METHOD_SET_BODY = `
    // 默认输出设置
    this.outputRequestBody = this.inputRequestBody;
    this.outputResponseBody = this.inputResponseBody;
  `;

  /**
   * 流程节点脚本模板
   * 对应Java中的FLOW_NODES_SCRIPT_TEMPLATE
   */
  private static readonly FLOW_NODES_SCRIPT_TEMPLATE = `
    // 动态生成的流程节点类
    export class %s extends FlowNodeTask {
      constructor(
        nodeId: string,
        body: string,
        requestHeaders: Map<string, string>,
        requestParams: Map<string, string>,
        responseHeaders: Map<string, string>
      ) {
        super(nodeId, body, requestHeaders, requestParams, responseHeaders);
      }

      async call(): Promise<void> {
        %s
        %s
      }

      %s
    }
  `;

  constructor(private readonly httpService: HttpService) {}

  // ==================== 代码生成方法 ====================

  /**
   * 生成数据转换源代码
   * @param sourceData 源数据表达式
   * @returns 生成的代码
   */
  public static generateDataConvSourceCode(sourceData: string): string {
    return FlowNodeUtil.DATA_CONV_TEMPLATE.replace('%s', sourceData);
  }

  /**
   * 生成路由双精度比较源代码
   * @param leftV 左值表达式
   * @param cmp 比较操作符
   * @param rightV 右值表达式
   * @returns 生成的代码
   */
  public static generateRouteDoubleCompareSourceCode(
    leftV: string,
    cmp: string,
    rightV: string,
  ): string {
    return FlowNodeUtil.ROUTE_DOUBLE_CMP_TEMPLATE.replace('%s', leftV)
      .replace('%s', rightV)
      .replace('%s', cmp);
  }

  /**
   * 生成路由长整型比较源代码
   * @param leftV 左值表达式
   * @param cmp 比较操作符
   * @param rightV 右值表达式
   * @returns 生成的代码
   */
  public static generateRouteLongCompareSourceCode(
    leftV: string,
    cmp: string,
    rightV: string,
  ): string {
    return FlowNodeUtil.ROUTE_LONG_CMP_TEMPLATE.replace('%s', leftV)
      .replace('%s', rightV)
      .replace('%s', cmp);
  }

  /**
   * 生成路由字符串比较源代码
   * @param leftV 左值表达式
   * @param cmp 比较操作符
   * @param rightV 右值表达式
   * @returns 生成的代码
   */
  public static generateRouteStringCompareSourceCode(
    leftV: string,
    cmp: string,
    rightV: string,
  ): string {
    return FlowNodeUtil.ROUTE_STRING_CMP_TEMPLATE.replace('%s', leftV)
      .replace('%s', rightV)
      .replace('%s', cmp);
  }

  /**
   * 生成路由日期时间比较源代码
   * @param leftV 左值表达式
   * @param cmp 比较操作符
   * @param rightV 右值表达式
   * @returns 生成的代码
   */
  public static generateRouteDatetimeCompareSourceCode(
    leftV: string,
    cmp: string,
    rightV: string,
  ): string {
    return FlowNodeUtil.ROUTE_DATETIME_CMP_TEMPLATE.replace('%s', leftV)
      .replace('%s', rightV)
      .replace('%s', cmp);
  }

  /**
   * 生成请求头删除源代码
   * @param key 请求头键
   * @returns 生成的代码
   */
  public static generateReqHeaderDeleteSourceCode(key: string): string {
    return FlowNodeUtil.REQ_HEADER_DEL_TEMPLATE.replace('%s', key);
  }

  /**
   * 生成请求头设置源代码
   * @param key 请求头键
   * @param value 请求头值
   * @returns 生成的代码
   */
  public static generateReqHeaderSetSourceCode(
    key: string,
    value: string,
  ): string {
    return FlowNodeUtil.REQ_HEADER_SET_TEMPLATE.replace('%s', key).replace(
      '%s',
      value,
    );
  }

  /**
   * 生成响应头删除源代码
   * @param key 响应头键
   * @returns 生成的代码
   */
  public static generateRspHeaderDeleteSourceCode(key: string): string {
    return FlowNodeUtil.RSP_HEADER_DEL_TEMPLATE.replace('%s', key);
  }

  /**
   * 生成响应头设置源代码
   * @param key 响应头键
   * @param value 响应头值
   * @returns 生成的代码
   */
  public static generateRspHeaderSetSourceCode(
    key: string,
    value: string,
  ): string {
    return FlowNodeUtil.RSP_HEADER_SET_TEMPLATE.replace('%s', key).replace(
      '%s',
      value,
    );
  }

  /**
   * 生成端口布尔脚本源代码
   * @param methodName 方法名
   * @param boolMethodImpl 布尔方法实现
   * @returns 生成的代码
   */
  public static generatePortBoolScriptSourceCode(
    methodName: string,
    boolMethodImpl: string,
  ): string {
    return FlowNodeUtil.MULTI_PORT_BOOL_METHOD_TEMPLATE.replace(
      '%s',
      methodName,
    ).replace('%s', boolMethodImpl);
  }

  /**
   * 生成端口调用脚本源代码
   * @param methodName 方法名
   * @param activateNodeId 激活节点ID
   * @returns 生成的代码
   */
  public static generatePortCallScriptSourceCode(
    methodName: string,
    activateNodeId: string,
  ): string {
    return FlowNodeUtil.MULTI_PORT_CALL_METHOD_TEMPLATE.replace(
      '%s',
      methodName,
    ).replace('%s', activateNodeId);
  }

  /**
   * 生成路径变量表达式
   * @param pathVarName 路径变量名
   * @param defaultValue 默认值
   * @returns 生成的表达式
   */
  public static generatePathValExp(
    pathVarName: string,
    defaultValue: string,
  ): string {
    // private static readonly NODE_HTTP_PATH_VAL_EXP_TEMPLATE = `
    //   // 获取路径变量值
    //   (this.requestParams['%s'] || %s)
    // `;
    return FlowNodeUtil.NODE_HTTP_PATH_VAL_EXP_TEMPLATE.replace(
      '%s',
      pathVarName,
    ).replace('%s', defaultValue);
  }

  /**
   * 生成路径替换语句
   * @param pathVarName 路径变量名
   * @param defaultValue 默认值
   * @returns 生成的语句：url.replace('{userId}', (this.requestParams['userId'] || defaultValue));
   */
  //   这个函数通常用于处理RESTful API的路径参数，比如：
  // - 原始URL： https://api.example.com/users/{userId}/profile
  // - 生成的代码会将 {userId} 替换为实际的用户ID
  // - 如果请求参数中有 userId=123 ，最终URL变成： https://api.example.com/users/123/profile
  // - 如果请求参数中没有 userId ，则使用默认值： https://api.example.com/users/defaultValue/profile
  public static generatePathReplaceStatement(
    pathVarName: string,
    defaultValue: string,
  ): string {
    // 这个表达式是获取路径值的
    const pathValExp = FlowNodeUtil.generatePathValExp(
      pathVarName,
      defaultValue,
    );
    const pathVarBracket = `{${pathVarName}}`;
    // private static readonly NODE_HTTP_PATH_REPLACE_TEMPLATE = `
    //   // 替换路径变量
    //   url = url.replace('%s', %s);
    // `;
    return FlowNodeUtil.NODE_HTTP_PATH_REPLACE_TEMPLATE.replace(
      '%s',
      pathVarBracket,
    ).replace('%s', pathValExp);
  }

  /**
   * 生成路径替换方法定义
   * @param methodBody 方法体
   * @returns 生成的方法定义
   */
  public static generatePathReplaceMethodDefine(methodBody: string): string {
    return FlowNodeUtil.NODE_HTTP_PATH_REPLACE_METHOD_TEMPLATE.replace(
      '%s',
      methodBody,
    );
  }

  /**
   * 生成HTTP POST任务脚本源代码
   * @param url 请求URL
   * @param requestTimeout 请求超时时间
   * @returns 生成的代码
   */
  public static generateNodeHttpTaskPostScriptSourceCode(
    url: string,
    requestTimeout: number,
  ): string {
    return FlowNodeUtil.NODE_HTTP_TASK_POST_EXEC_TEMPLATE.replace(
      '%s',
      url,
    ).replace('%d', requestTimeout.toString());
  }

  /**
   * 生成HTTP GET任务脚本源代码
   * @param url 请求URL
   * @param requestTimeout 请求超时时间
   * @returns 生成的代码
   */
  public static generateNodeHttpTaskGetScriptSourceCode(
    url: string,
    requestTimeout: number,
  ): string {
    return FlowNodeUtil.NODE_HTTP_TASK_GET_EXEC_TEMPLATE.replace(
      '%s',
      url,
    ).replace('%d', requestTimeout.toString());
  }

  /**
   * 生成单输出流程节点任务源代码
   * @param nodeId 节点ID
   * @param callScript 调用脚本
   * @param additionDefineScript 附加定义脚本
   * @returns 生成的源代码
   */
  public static generateFlowNodeTaskSourceCodeWhenSingleOutput(
    nodeId: string,
    callScript: string,
    additionDefineScript: string,
  ): string {
    const className = `FlowNode_${nodeId}`;
    return FlowNodeUtil.FLOW_NODES_SCRIPT_TEMPLATE.replace('%s', className)
      .replace('%s', callScript)
      .replace('%s', '')
      .replace('%s', additionDefineScript);
  }

  /**
   * 生成多输出流程节点任务源代码
   * @param nodeId 节点ID
   * @param callScript 调用脚本
   * @param boolExp 布尔表达式
   * @param additionDefineScript 附加定义脚本
   * @returns 生成的源代码
   */
  public static generateFlowNodeTaskSourceCodeWhenMultiOutput(
    nodeId: string,
    callScript: string,
    boolExp: string,
    additionDefineScript: string,
  ): string {
    const className = `FlowNode_${nodeId}`;
    return FlowNodeUtil.FLOW_NODES_SCRIPT_TEMPLATE.replace('%s', className)
      .replace('%s', callScript)
      .replace('%s', boolExp)
      .replace('%s', additionDefineScript);
  }

  // ==================== 流程处理方法 ====================

  /**
   * 创建简单流程
   * @param links 所有实际执行的流程连接（不包括虚拟连接）
   * @param nodes 所有实际执行的流程节点（不包括虚拟节点）
   * @returns 实际执行流程
   */
  public static makeStFlow(links: VsLink[], nodes: VsNode[]): Flow {
    const flow: Flow = {
      links: new Set(
        links.map((e) => ({
          sourceId: e.sourceId,
          targetId: e.targetId,
        })),
      ),
      nodes: new Set(
        nodes.map((n) => ({
          nodeId: n.id,
        })),
      ),
    };
    return flow;
  }

  /**
   * 获取节点ID映射
   * 注意！结果元素必须唯一
   * @param flow 流程
   * @param nodeId2node 节点ID到节点的映射
   * @returns 节点ID映射
   * @throws DataConsistencyException 数据一致性异常
   */
  public static getNodeIdsMap(
    flow: Flow,
    nodeId2node: Map<string, VsNode>,
  ): Map<string, string[]> {
    const nodes = Array.from(flow.nodes);
    const links = Array.from(flow.links);

    // 获取所有边的起始和目标节点
    const startNodeIdSet = new Set<string>();
    const endNodeIdSet = new Set<string>();

    if (links.length > 0) {
      links.forEach((link) => {
        startNodeIdSet.add(link.sourceId);
        endNodeIdSet.add(link.targetId);
      });
    }

    // 获取Node节点集合
    const allNodeIdSet = new Set<string>();
    startNodeIdSet.forEach((id) => allNodeIdSet.add(id));
    endNodeIdSet.forEach((id) => allNodeIdSet.add(id));

    // 获取流程的起始节点和终止节点
    const startNodeId = FlowNodeUtil.getStartNodeId(
      allNodeIdSet,
      endNodeIdSet,
      new Set(nodes),
      new Set(links),
      nodeId2node,
    );
    const endNodeIds = FlowNodeUtil.getEndNodeIds(
      allNodeIdSet,
      startNodeIdSet,
      new Set(nodes),
      new Set(links),
      nodeId2node,
    );

    const result = new Map<string, string[]>();
    result.set(FlowNodeUtil.START_NODE_ID_KEY, startNodeId);
    result.set(FlowNodeUtil.END_NODE_ID_KEY, endNodeIds);
    result.set(FlowNodeUtil.ALL_VALID_NODE_ID_KEY, Array.from(allNodeIdSet));

    return result;
  }

  /**
   * 获取起始节点ID
   * @param nodeIdSet 节点ID集合
   * @param endNodeSet 结束节点集合
   * @param nodes 节点集合
   * @param links 连接集合
   * @param nodeId2node 节点ID到节点的映射
   * @returns 起始节点ID列表
   * @throws DataConsistencyException 数据一致性异常
   */
  public static getStartNodeId(
    nodeIdSet: Set<string>,
    endNodeSet: Set<string>,
    nodes: Set<FlowNode>,
    links: Set<FlowLink>,
    nodeId2node: Map<string, VsNode>,
  ): string[] {
    const startNodeId: string[] = []; // 大小必须等于1

    for (const nodeId of nodeIdSet) {
      if (!endNodeSet.has(nodeId)) {
        const vsNode = nodeId2node.get(nodeId);
        if (vsNode && vsNode.taskType === VsNodeTaskTypeEnum.CONTEXT) {
          startNodeId.push(nodeId);
        }
      }
    }

    if (startNodeId.length !== 1) {
      throw new DataConsistencyException('未找到起点组件或起点组件未连线');
    }

    return startNodeId;
  }

  /**
   * 获取结束节点ID列表
   * @param nodeIdSet 节点ID集合
   * @param startNodeSet 起始节点集合
   * @param nodes 节点集合
   * @param links 连接集合
   * @param nodeId2node 节点ID到节点的映射
   * @returns 结束节点ID列表
   * @throws DataConsistencyException 数据一致性异常
   */
  public static getEndNodeIds(
    nodeIdSet: Set<string>,
    startNodeSet: Set<string>,
    nodes: Set<FlowNode>,
    links: Set<FlowLink>,
    nodeId2node: Map<string, VsNode>,
  ): string[] {
    const endNodeIds: string[] = []; // 大小必须 >= 1

    for (const nodeId of nodeIdSet) {
      if (!startNodeSet.has(nodeId)) {
        const vsNode = nodeId2node.get(nodeId);
        if (vsNode && vsNode.taskType === VsNodeTaskTypeEnum.END) {
          endNodeIds.push(nodeId);
        }
      }
    }

    if (endNodeIds.length === 0) {
      throw new DataConsistencyException(
        '不存在响应处理脚本或未以响应处理脚本结束',
      );
    }

    return endNodeIds;
  }

  /**
   * 获取编译后的脚本
   * @param nodeId 节点ID
   * @param script 脚本内容
   * @returns 编译后的脚本
   * @throws ScriptCompileException 脚本编译异常
   * todo: 如果script中含有import 依赖包，怎么办？!!!!!
   */
  public static async getCompiledScript(
    nodeId: string,
    script: string,
  ): Promise<string> {
    try {
      // 在Node.js环境中，我们可以直接返回脚本内容
      // 因为TypeScript/JavaScript不需要像Java那样编译成字节码
      // 但我们可以进行语法检查
      const context = vm.createContext({
        FlowNodeTask,
        console,
        require,
        exports,
        module,
        __filename: `node_${nodeId}.ts`,
        __dirname: process.cwd(),
      });

      // 尝试编译脚本以检查语法错误
      vm.runInContext(`(function() { ${script} })()`, context, {
        filename: `node_${nodeId}.ts`,
        timeout: 5000,
      });

      return script;
    } catch (error) {
      throw new ScriptCompileException(`脚本语法错误: ${error.message}`);
    }
  }

  /**
   * 获取实际输出端口
   * @param ports 所有端口
   * @param nodeId2node 所有节点映射，键：节点ID，值：节点
   * @param endNodeId2node 原子结束节点映射，键：原子结束节点ID，值：节点
   * @returns 实际端口，仅包含用于生成节点脚本和编译节点脚本的输出端口
   * @throws DataConsistencyException 数据一致性异常
   */
  public static getActualOutputPorts(
    ports: VsPort[],
    nodeId2node: Map<string, VsNode>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    endNodeId2node: Map<string, VsNode>,
  ): VsPort[] {
    const actualOutputPorts: VsPort[] = [];
    if (!ports) {
      return actualOutputPorts;
    }

    for (const vsPort of ports) {
      const vsNode = nodeId2node.get(vsPort.nodeId);
      if (!vsNode) {
        throw new DataConsistencyException(`无法找到节点,ID=${vsPort.nodeId}`);
      }

      // 原子节点的输出端口没有问题，是实际的
      if (vsPort.type === VsPortTypeEnum.OUTPUT_PORT) {
        if (vsNode.viewType === VsNodeViewTypeEnum.ATOMIC) {
          actualOutputPorts.push(vsPort);
        }
      }

      // 结束节点只存在输入端口，所以我们使用输入端口脚本...
      if (vsPort.type === VsPortTypeEnum.INPUT_PORT) {
        if (vsNode.taskType === VsNodeTaskTypeEnum.END) {
          const genPort = { ...vsPort };
          // 更改输出类型，以便稍后我们可以生成节点任务代码
          genPort.type = VsPortTypeEnum.OUTPUT_PORT;
          actualOutputPorts.push(genPort);
        }
      }
    }

    return actualOutputPorts;
  }

  /**
   * 获取实际连接，不会过滤掉游离链接，只是过滤掉复合组件端口上的节点，游离link的检测和处理是在流程图构建和验证的后续步骤中进行的。
   * @param links 所有连接
   * @param nodeId2node 所有节点映射，键：节点ID，值：节点
   * @param portId2Port 所有端口映射，键：端口ID，值：端口
   * @param sourcePort2Link 所有连接映射，键：连接起始节点ID，值：连接
   * @param nodeId2NodeName 节点ID到节点名称的映射
   * @returns 执行流程的实际连接
   * @throws DataConsistencyException 数据一致性异常
   */
  public static getActualLinks(
    links: VsLink[],
    nodeId2node: Map<string, VsNode>,
    portId2Port: Map<string, VsPort>,
    sourcePort2Link: Map<string, VsLink>,
    nodeId2NodeName: Map<string, string>,
  ): VsLink[] {
    const actualLinks: VsLink[] = [];
    if (!links) {
      return actualLinks;
    }

    for (const vsLink of links) {
      const startNodeId = vsLink.sourceId;
      const startNode = nodeId2node.get(startNodeId);

      if (startNode.viewType === VsNodeViewTypeEnum.COMPOSITE) {
        // 忽略以虚拟节点开始的连接
        continue;
      }

      let endNodeId: string = null;

      // 生成实际连接
      const sourcePort = vsLink.sourcePort;
      let targetPort = vsLink.targetPort;

      for (let i = 0; i < 100000; ++i) {
        if (i > 90000) {
          throw new Error('当前版本不支持太大的图');
        }

        const tempPort = portId2Port.get(targetPort);
        if (!tempPort) {
          throw new Error(`无法找到端口,ID=${targetPort}`);
        }

        // 结束节点
        const tempNode = nodeId2node.get(tempPort.nodeId);
        if (!tempNode) {
          throw new Error(`无法找到节点,ID=${tempPort.nodeId}`);
        }
        // 开始节点为非 VsNodeViewTypeEnum.COMPOSITE，结束节点为 VsNodeViewTypeEnum.ATOMIC
        // 注意，虚拟节点是前端自己构建的，后端不保存，后端会把VsNodeViewTypeEnum.COMPOSITE的输出端口作为二图层的输入端口
        if (tempNode.viewType === VsNodeViewTypeEnum.ATOMIC) {
          endNodeId = tempNode.id;
          break;
        } else {
          // 当link的结束节点为复合组件时，寻找下一个link，把复合组件跳过，其下一个link的输出端口作为新的link的目标端口
          const tempLink = sourcePort2Link.get(targetPort);
          if (!tempLink) {
            throw new DataConsistencyException(
              `以节点[${nodeId2NodeName.get(startNodeId) || ''}]开始的路径上存在端口未连接边`,
            );
          }
          // 更新link的targetPort，进入下一轮循环，会更新endNodeId
          targetPort = tempLink.targetPort;
        }
      }

      // 更新连接目标节点ID
      const actualLink: VsLink = {
        id: vsLink.id,
        sourceId: startNodeId,
        targetId: endNodeId,
        sourcePort: sourcePort,
        targetPort: targetPort,
      };
      actualLinks.push(actualLink);
    }

    return actualLinks;
  }

  /**
   * 创建节点任务脚本
   * @param links 实际执行流程连接，不包含复合节点，但包含游离节点
   * @param ports 实际执行流程输出端口
   * @param nodes 所有原子节点
   * @param nodeId2NodeName 节点ID到节点名称的映射
   * @returns 节点ID到脚本的映射
   * @throws DataConsistencyException 数据一致性异常
   */
  public static makeNodeTaskScript(
    links: VsLink[],
    ports: VsPort[],
    nodes: VsNode[],
    nodeId2NodeName: Map<string, string>,
  ): Map<string, string> {
    const nodeId2Script = new Map<string, string>();

    // 边的起始节点ID-边列表
    const nodeId2StartLinks = new Map<string, VsLink[]>();
    links.forEach((link) => {
      if (!nodeId2StartLinks.has(link.sourceId)) {
        nodeId2StartLinks.set(link.sourceId, []);
      }
      nodeId2StartLinks.get(link.sourceId).push(link);
    });

    // 端口的节点ID-端口列表(只包括输出端口)
    const nodeId2OutputPorts = new Map<string, VsPort[]>();
    ports.forEach((port) => {
      if (!nodeId2OutputPorts.has(port.nodeId)) {
        nodeId2OutputPorts.set(port.nodeId, []);
      }
      nodeId2OutputPorts.get(port.nodeId).push(port);
    });

    // 节点ID-节点(只包括原子节点)
    const nodeId2node = new Map<string, VsNode>();
    nodes.forEach((node) => nodeId2node.set(node.id, node));

    // 根据节点来进行遍历,生成任务脚本内容
    const flow = FlowNodeUtil.makeStFlow(links, nodes);
    // 所有边的端口开始和目标节点
    const nodeIdsMap = FlowNodeUtil.getNodeIdsMap(flow, nodeId2node);
    const waitCompileNodeIds = nodeIdsMap.get(
      FlowNodeUtil.ALL_VALID_NODE_ID_KEY,
    );

    for (const curNodeId of waitCompileNodeIds) {
      // nodeId2StartLinks是以所有边的开始节点为key的
      // 获取以当前节点作为开始节点的边
      const curLinks = nodeId2StartLinks.get(curNodeId) || [];
      const curOutputPorts = nodeId2OutputPorts.get(curNodeId) || [];
      let curNodeTaskScript: string;

      // 校验当前节点ID是否在原子节点列表里面
      FlowNodeUtil.validateNodeInAtomicNodes(curNodeId, nodeId2node);

      // 没有边的起始节点为当前节点,则当前节点为终止节点,终止节点端口数量必须为1
      if (curLinks.length === 0) {
        // 校验类型是否一致
        FlowNodeUtil.validateEndNodeType(
          curNodeId,
          nodeId2node,
          nodeId2NodeName,
        );
        // 校验终止节点的端口数量
        FlowNodeUtil.validateEndNodePorts(
          curNodeId,
          curOutputPorts,
          nodeId2NodeName,
        );
        // 终止节点只会有1个输出端口，里面内容为脚本，只不过前端不显示endport罢了         makeNodeTaskScripWhenSingleOutput
        curNodeTaskScript = FlowNodeUtil.makeNodeTaskScripWhenSingleOutput(
          curNodeId,
          curOutputPorts,
          nodeId2NodeName,
        );
      } else {
        // 校验非终止节点的端口数量
        FlowNodeUtil.validateNonEndNodePorts(
          curNodeId,
          curOutputPorts,
          nodeId2NodeName,
        );
        const curNode = nodeId2node.get(curNodeId);

        // 不能使用节点的端口数量来决定生成脚本
        // 因为当ROUTE节点任务类型时，我们仍然可以创建只有一个分支
        if (curNode.taskType !== VsNodeTaskTypeEnum.ROUTE) {
          // 单个输出端口节点类型
          curNodeTaskScript = FlowNodeUtil.makeNodeTaskScripWhenSingleOutput(
            curNodeId,
            curOutputPorts,
            nodeId2NodeName,
          );
        } else {
          // 多个输出端口节点类型
          curNodeTaskScript = FlowNodeUtil.makeNodeTaskScriptWhenMultiOutput(
            curNodeId,
            curOutputPorts,
            curLinks,
            nodeId2NodeName,
          );
        }
      }

      // 校验当前节点的任务脚本是否为空
      FlowNodeUtil.validateNodeTaskScript(
        curNodeId,
        curNodeTaskScript,
        nodeId2NodeName,
      );
      nodeId2Script.set(curNodeId, curNodeTaskScript);
    }

    return nodeId2Script;
  }

  /**
   * 创建单输出节点任务脚本
   * 使用时,需确保curPorts的大小为1
   * @param curNodeId 当前节点ID
   * @param curPorts 当前端口列表
   * @param nodeId2NodeName 节点ID到节点名称的映射
   * @returns 节点任务脚本
   * @throws DataConsistencyException 数据一致性异常
   */
  public static makeNodeTaskScripWhenSingleOutput(
    curNodeId: string,
    curPorts: VsPort[],
    nodeId2NodeName: Map<string, string>,
  ): string {
    if (!curPorts || curPorts.length !== 1) {
      throw new DataConsistencyException(
        `节点[${nodeId2NodeName.get(curNodeId) || ''}]端口数量应为1,当前端口数量为${curPorts ? curPorts.length : 0}`,
      );
    }

    const curPort = curPorts[0];
    const propScript = FlowNodeUtil.getScriptFromPort(curPort);
    const callScript = FlowNodeUtil.SINGLE_OUTPUT_CALL_METHOD_TEMPLATE.replace(
      '%s',
      propScript,
    );
    const additionDefineScript =
      FlowNodeUtil.getAdditionDefineFromVsPort(curPort);

    return FlowNodeUtil.generateFlowNodeTaskSourceCodeWhenSingleOutput(
      curNodeId,
      callScript,
      additionDefineScript,
    );
  }

  /**
   * 创建多输出节点任务脚本
   * @param curNodeId 当前节点ID
   * @param curPorts 当前端口列表
   * @param curLinks 当前连接列表
   * @param nodeId2NodeName 节点ID到节点名称的映射
   * @returns 节点任务脚本
   * @throws DataConsistencyException 数据一致性异常
   * 方法解释看文件：flow-node.md
   */
  public static makeNodeTaskScriptWhenMultiOutput(
    curNodeId: string,
    curPorts: VsPort[],
    curLinks: VsLink[],
    nodeId2NodeName: Map<string, string>,
  ): string {
    // 多个输出端口,需要用户确保只有1个端口为true
    const boolExpHolder: string[] = [];
    const callExpHolder: string[] = [FlowNodeUtil.DEFAULT_CALL_METHOD_SET_BODY]; // 默认体设置
    const additionDefineExpHolder: string[] = [];

    const portSize = curPorts.length;
    for (let i = 0; i < portSize; i++) {
      boolExpHolder.push('%s');
      callExpHolder.push('%s');
      additionDefineExpHolder.push('%s');
    }

    const boolExpTemplate = boolExpHolder.join('\n');
    const callExpTemplate = callExpHolder.join('\n');
    const additionDefineExpTemplate = additionDefineExpHolder.join('\n');

    // 边的起始端口ID-边
    const startPortId2Link = new Map<string, FlowLink>();
    curLinks.forEach((link) => startPortId2Link.set(link.sourcePort, link));

    const portScripts: string[] = new Array(portSize);
    const callScripts: string[] = new Array(portSize);
    const additionDefineScripts: string[] = new Array(portSize);

    for (let i = 0; i < portSize; i++) {
      const curPort = curPorts[i];
      const portId = curPort.id;
      const propScript = FlowNodeUtil.getScriptFromPort(curPort);
      const curLink = startPortId2Link.get(portId);

      if (!propScript) {
        throw new DataConsistencyException(
          `节点[${nodeId2NodeName.get(curNodeId) || ''}]存在端口未配置`,
        );
      }

      if (!curLink) {
        throw new DataConsistencyException(
          `节点[${nodeId2NodeName.get(curNodeId) || ''}]存在端口未连接边`,
        );
      }

      // private static readonly MULTI_PORT_BOOL_METHOD_TEMPLATE = `
      //   // 端口条件判断方法
      //   private %s(): boolean {
      //     %s
      //   }
      // `;
      const curPortScript = FlowNodeUtil.generatePortBoolScriptSourceCode(
        portId,
        propScript,
      );
      portScripts[i] = curPortScript;

      // private static readonly MULTI_PORT_CALL_METHOD_TEMPLATE = `
      //   // 端口调用方法
      //   // methodName为portId，就是上面FlowNodeUtil.generatePortBoolScriptSourceCode curPortScript生成的Boolean判断方法
      //   // setActivatedNodeId的值为当前link的endNodeId
      //   if (this.%s()) {
      //     this.setActivatedNodeId('%s');
      //     return;
      //   }
      // `;
      const curCallScript = FlowNodeUtil.generatePortCallScriptSourceCode(
        portId,
        curLink.targetId,
      );
      callScripts[i] = curCallScript;

      const curAdditionDefineScript =
        FlowNodeUtil.getAdditionDefineFromVsPort(curPort);
      additionDefineScripts[i] = curAdditionDefineScript;
    }

    const boolExp = this.formatTemplate(boolExpTemplate, portScripts);
    const callExp = this.formatTemplate(callExpTemplate, callScripts);
    const additionDefineExp = this.formatTemplate(
      additionDefineExpTemplate,
      additionDefineScripts,
    );

    return FlowNodeUtil.generateFlowNodeTaskSourceCodeWhenMultiOutput(
      curNodeId,
      callExp,
      boolExp,
      additionDefineExp,
    );
  }

  /**
   * 格式化模板字符串
   * @param template 模板字符串
   * @param args 参数数组
   * @returns 格式化后的字符串
   */
  private static formatTemplate(template: string, args: string[]): string {
    let result = template;
    for (const arg of args) {
      result = result.replace('%s', arg);
    }
    return result;
  }

  /**
   * 从端口获取脚本
   * @param port 流程端口
   * @returns 脚本内容
   * @throws DataConsistencyException 数据一致性异常
   */
  public static getScriptFromPort(port: VsPort): string {
    try {
      const properties = port.properties;
      const script = properties.script;
      return script || '';
    } catch (error) {
      throw new DataConsistencyException(`无法获取脚本属性,端口ID=${port.id}`);
    }
  }

  /**
   * 从端口获取附加定义
   * @param port 流程端口
   * @returns 附加定义内容
   */
  public static getAdditionDefineFromVsPort(port: VsPort): string {
    try {
      const properties = port.properties;
      const additionDefine = properties.additionDefine;
      return additionDefine || '';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return '';
    }
  }

  /**
   * 处理流程执行
   * @param start 起始流程节点任务
   * @param msgId 消息ID
   * @param contextPath 上下文路径
   * @param method HTTP方法
   * @param systemHeader 系统头信息
   * @returns 最终执行的流程节点任务
   */
  public async processFlow(
    start: FlowNodeTask,
    msgId: string,
    contextPath: string,
    method: VsHttpMethodEnum,
    systemHeader: Map<string, string>,
  ): Promise<FlowNodeTask> {
    let loopCnt = 0;
    let currentFlowNodeTask = start;

    while (true) {
      loopCnt++;
      if (loopCnt > FlowNodeUtil.MAX_DEPTH) {
        throw new Error(`执行流路径长度不能超过${FlowNodeUtil.MAX_DEPTH}`);
      }

      let nextFlowNodeTask: FlowNodeTask | null = null;
      try {
        // 执行当前节点任务
        await currentFlowNodeTask.call();

        // 获取激活的节点ID
        const activatedNode = currentFlowNodeTask.getActivatedNodeId();
        const childNodes = currentFlowNodeTask.getChildNodes();

        // 如果没有子节点，表明当前节点为结束节点
        if (!childNodes || childNodes.size === 0) {
          break;
        }

        // 获取下一个要执行的节点
        nextFlowNodeTask = childNodes.get(activatedNode);
        if (!nextFlowNodeTask) {
          throw new Error(
            `无法获取激活的子节点,当前节点为[${currentFlowNodeTask.getNodeName()}]`,
          );
        }
      } catch (error) {
        throw error;
      }

      // 设置下一个节点的输入数据
      nextFlowNodeTask.setInputRequestBody(
        currentFlowNodeTask.getOutputRequestBody(),
      );
      nextFlowNodeTask.setInputResponseBody(
        currentFlowNodeTask.getOutputResponseBody(),
      );
      nextFlowNodeTask.setFlowCtx(currentFlowNodeTask.getFlowCtx());
      currentFlowNodeTask = nextFlowNodeTask;
    }
    return currentFlowNodeTask;
  }

  /**
   * 校验非终止节点的端口数量是否满足要求
   * @param curNodeId 当前节点ID
   * @param curPorts 当前端口列表
   * @param nodeId2NodeName 节点ID到节点名称的映射
   */
  public static validateNonEndNodePorts(
    curNodeId: string,
    curPorts: VsPort[] | null,
    nodeId2NodeName: Map<string, string>,
  ): void {
    if (!curPorts || curPorts.length === 0) {
      throw new VsDataConsistencyException(
        `节点[${nodeId2NodeName.get(curNodeId)}]应该至少有1个输出端口,当前输出端口数量为0`,
      );
    }
  }

  /**
   * 校验终止节点的端口数量是否满足要求
   * @param curNodeId 当前节点ID
   * @param curPorts 当前端口列表
   * @param nodeId2NodeName 节点ID到节点名称的映射
   */
  public static validateEndNodePorts(
    curNodeId: string,
    curPorts: VsPort[] | null,
    nodeId2NodeName: Map<string, string>,
  ): void {
    if (!curPorts || curPorts.length !== 1) {
      throw new VsDataConsistencyException(
        `响应处理脚本节点[${nodeId2NodeName.get(curNodeId) || ''}],不能有多个输出端口`,
      );
    }
  }

  /**
   * 校验当前节点的任务脚本是否为空
   * @param curNodeId 当前节点ID
   * @param curNodeTaskScript 当前节点任务脚本
   * @param nodeId2NodeName 节点ID到节点名称的映射
   */
  public static validateNodeTaskScript(
    curNodeId: string,
    curNodeTaskScript: string,
    nodeId2NodeName: Map<string, string>,
  ): void {
    if (!curNodeTaskScript || curNodeTaskScript.trim() === '') {
      throw new VsDataConsistencyException(
        `节点[${nodeId2NodeName.get(curNodeId) || ''}]任务为空`,
      );
    }
  }

  /**
   * 校验当前节点ID是否在原子节点列表里面
   * @param curNodeId 当前节点ID
   * @param atomicNodeId2node 原子节点ID到节点的映射
   */
  public static validateNodeInAtomicNodes(
    curNodeId: string,
    atomicNodeId2node: Map<string, VsNode>,
  ): void {
    const curNode = atomicNodeId2node.get(curNodeId);
    if (!curNode) {
      throw new VsDataConsistencyException(`找不到节点[${curNodeId}]`);
    }
  }

  /**
   * 校验结束节点类型是否正确
   * @param endNodeId 结束节点ID
   * @param atomicNodeId2node 原子节点ID到节点的映射
   * @param nodeId2NodeName 节点ID到节点名称的映射
   */
  private static validateEndNodeType(
    endNodeId: string,
    atomicNodeId2node: Map<string, VsNode>,
    nodeId2NodeName: Map<string, string>,
  ): void {
    const endNode = atomicNodeId2node.get(endNodeId);
    if (!endNode || endNode.taskType !== VsNodeTaskTypeEnum.END) {
      throw new VsDataConsistencyException(
        `图需以响应处理脚本结束,当前图结束节点[${nodeId2NodeName.get(endNodeId) || ''}]不是响应处理脚本,请完善图`,
      );
    }
  }

  /**
   * 获取实际的原子节点列表
   * @param nodes 所有节点
   * @returns 实际的原子节点列表
   */
  public static getActualNodes(nodes: VsNode[] | null): VsNode[] {
    const atomicNodes: VsNode[] = [];
    if (!nodes) {
      return atomicNodes;
    }
    for (const vsNode of nodes) {
      if (vsNode.viewType === VsNodeViewTypeEnum.ATOMIC) {
        atomicNodes.push(vsNode);
      }
    }
    return atomicNodes;
  }

  /**
   * 从VsPort获取脚本
   * @param vsPort 端口对象
   * @returns 脚本内容
   */
  public static getScriptFromVsPort(vsPort: VsPort): string {
    const properties = vsPort.properties;
    const vsPortProp = properties;

    let script: string | null = null;
    try {
      script = vsPortProp.script;
    } catch (error) {
      throw new VsDataConsistencyException(
        `无法获取脚本属性,端口ID=${vsPort.id}`,
      );
    }

    if (!script || script.trim() === '') {
      return '';
    } else {
      return script;
    }
  }

  /**
   * 创建运行时流程
   * @param body 请求体
   * @param requestHeader 请求头
   * @param requestParam 请求参数
   * @param responseHeader 响应头
   * @param vsExecFlow 执行流程对象
   * @param queue 用户日志保存队列
   * @returns 流程节点任务
   */
  public static makeRtFlow(
    body: string,
    requestHeader: Map<string, string>,
    requestParam: Map<string, string>,
    responseHeader: Map<string, string>,
    vsExecFlow: VsExecFlow,
    queue: any, // 这里需要根据实际的队列类型进行调整
  ): FlowNodeTask {
    const flow = vsExecFlow.flow;
    const nodeId2Class = vsExecFlow.nodeId2Class;
    const nodeId2NodeName = vsExecFlow.nodeId2NodeName;
    const nodeId2Node = vsExecFlow.nodeId2Node;
    const nodeId2CircuitBreaker = vsExecFlow.nodeId2CircuitBreaker;
    const nodeId2GeneralDataConvMapping =
      vsExecFlow.nodeId2GeneralDataConvMapping;
    const flowCtx = new Map<string, any>();
    const ctx = vsExecFlow.ctx;

    const nodeIdsMap = FlowNodeUtil.getNodeIdsMap(flow, nodeId2Node);

    // 获取所有有效的Node ID集合
    const nodes = nodeIdsMap.get(FlowNodeUtil.ALL_VALID_NODE_ID_KEY);
    if (!nodes || nodes.length === 0) {
      throw new VsDataConsistencyException('空节点,无法构造执行流');
    }

    const links = flow.links;
    if (!links || links.size === 0) {
      throw new VsDataConsistencyException('空边,无法构造执行流');
    }

    // 创建所有节点
    const nodeid2nodetask = new Map<string, FlowNodeTask>();
    for (const nodeId of nodes) {
      const clazz = nodeId2Class.get(nodeId);
      if (!clazz) {
        throw new VsDataConsistencyException(
          `无法获取节点对应的元数据,节点ID=${nodeId}`,
        );
      }

      const flowNodeTask = FlowNodeUtil.makeFlowNodeTask(
        clazz,
        nodeId,
        body,
        requestHeader,
        requestParam,
        responseHeader,
      );

      flowNodeTask.setCircuitBreaker(nodeId2CircuitBreaker.get(nodeId));
      flowNodeTask.setNodeName(nodeId2NodeName.get(nodeId) || '-');

      const node = nodeId2Node.get(nodeId);
      flowNodeTask.setTaskType(node ? node.taskType : null);
      flowNodeTask.setDataConvRT(nodeId2GeneralDataConvMapping.get(nodeId));
      flowNodeTask.setFlowCtx(flowCtx);
      flowNodeTask.setCtx(ctx);
      flowNodeTask.setBlockingQueue(queue);

      nodeid2nodetask.set(nodeId, flowNodeTask);
    }

    // 根据连接创建依赖树
    for (const link of links) {
      const startNodeId = link.sourceId;
      const endNodeId = link.targetId;
      const startNodeTask = nodeid2nodetask.get(startNodeId);
      const endNodeTask = nodeid2nodetask.get(endNodeId);

      if (!startNodeTask || !endNodeTask) {
        throw new VsDataConsistencyException(
          `构造执行流失败,存在节点为空,端口开始节点ID=${startNodeId},端口结束节点ID=${endNodeId}`,
        );
      }

      startNodeTask.getChildNodes().set(endNodeId, endNodeTask);
    }

    // 清除结束节点的childNodes属性
    const endNodeIds = nodeIdsMap.get(FlowNodeUtil.END_NODE_ID_KEY) || [];
    for (const endNodeId of endNodeIds) {
      const endNodeTask = nodeid2nodetask.get(endNodeId);
      if (endNodeTask) {
        endNodeTask.setChildNodes(null);
      }
    }

    // 起始节点必须等于1
    const startNodeIds = nodeIdsMap.get(FlowNodeUtil.START_NODE_ID_KEY) || [];
    const startNodeId = startNodeIds[0];
    const startNodeTask = nodeid2nodetask.get(startNodeId)!;

    // 对于尚未开始的请求，inputRequestBody是body
    startNodeTask.setInputRequestBody(body);
    // 对于尚未开始的请求，inputResponseBody是null
    startNodeTask.setInputResponseBody(null);

    return startNodeTask;
  }

  /**
   * 创建流程节点任务实例
   * @param clazz 流程节点任务类
   * @param nodeId 节点ID
   * @param body 请求体
   * @param requestHeader 请求头
   * @param requestParam 请求参数
   * @param responseHeader 响应头
   * @returns 流程节点任务实例
   */
  public static makeFlowNodeTask(
    clazz: any, // 这里需要根据实际的类类型进行调整
    nodeId: string,
    body: string,
    requestHeader: Map<string, string>,
    requestParam: Map<string, string>,
    responseHeader: Map<string, string>,
  ): FlowNodeTask {
    try {
      // 在TypeScript/JavaScript中，我们需要使用不同的方式来创建实例
      // 这里假设clazz是一个构造函数
      const instance = new clazz(
        nodeId,
        body,
        requestHeader,
        requestParam,
        responseHeader,
      );
      return instance;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`构建节点对象失败,节点ID=${nodeId},msg=${msg}`);
    }
  }

  /**
   * 编译节点任务脚本
   * @param nodeId2Script 节点ID到脚本的映射
   * @param nodeId2NodeName 节点ID到节点名称的映射
   * @returns 节点ID到类字节码的映射
   */
  // 主要编译方法 - 参数与Java版本一致
  public static async compileNodeTaskScript(
    nodeId2Script: Map<string, string>,
    nodeId2NodeName: Map<string, string>,
  ): Promise<Map<string, CompiledScript>> {
    // 使用Map存储编译结果（对应Java的Map<String, byte[]>）
    const nodeId2CompiledScript = new Map<string, CompiledScript>();
    const compilePromises: Promise<void>[] = [];

    // TypeScript编译选项
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      sourceMap: true, // 生成源码映射便于调试
    };

    // 并行编译所有节点脚本（对应Java的线程池处理）
    for (const [nodeId, script] of nodeId2Script.entries()) {
      const compileTask = async () => {
        try {
          const nodeName = nodeId2NodeName.get(nodeId) || nodeId;

          // 编译TypeScript代码
          const result = ts.transpile(script, compilerOptions, `${nodeId}.ts`);

          // 检查编译错误
          if (!result || result.trim() === '') {
            throw new ScriptCompileException(
              `编译节点[${nodeName}]失败: 编译结果为空`,
            );
          }

          // 存储编译结果
          const compiledScript: CompiledScript = {
            nodeId,
            compiledCode: result,
            sourceMap: undefined, // 如果需要可以添加sourceMap
          };

          nodeId2CompiledScript.set(nodeId, compiledScript);
        } catch (error) {
          const nodeName = nodeId2NodeName.get(nodeId) || nodeId;

          if (error instanceof ScriptCompileException) {
            throw error;
          } else {
            throw new ScriptCompileException(
              `编译节点[${nodeName}]失败:\n${error.message}`,
            );
          }
        }
      };

      compilePromises.push(compileTask());
    }

    // 等待所有编译任务完成（对应Java的future.get()）
    try {
      await Promise.all(compilePromises);
    } catch (error) {
      // 重新抛出编译异常
      throw error;
    }

    return nodeId2CompiledScript;
  }

  /**
   * 从字节码获取类
   * @param nodeId 节点ID
   * @param classBytes 类字节码
   * @returns 流程节点任务类
   */
  public static getClass(nodeId: string, classBytes: Uint8Array): any {
    try {
      // 在JavaScript/TypeScript中，我们从字节数组中恢复脚本信息
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(classBytes);
      const scriptInfo = JSON.parse(jsonString);

      // 这里我们可以使用eval来执行脚本，或者返回一个包含脚本的对象
      // 为了安全起见，建议使用Function构造函数而不是eval
      const scriptFunction = new Function('return ' + scriptInfo.script);
      return scriptFunction();
    } catch (error) {
      throw new Error(`无法从字节码获取类: ${error}`);
    }
  }
}

// 相关的类和接口定义
export interface VsPortProp {
  script: string;
  additionDefine: string;
}

export class VsDataConsistencyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VsDataConsistencyException';
  }
}
