import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { CircuitBreaker } from 'opossum';
import { HttpUtil } from '@app/utils/http/HttpUtil';
import {
  AsyncHttpConnPoolUtil,
  Header,
} from '@app/utils/http/AsyncHttpConnPoolUtil';

/**
 * HTTP Flow Node Task Service
 * 对应Java类: FlowNodeTask_p15n_HTTP_753e406c_e300_4297_947e_7200c5ed48f3
 */
@Injectable()
export class FlowService {
  private readonly logger = new Logger(FlowService.name);

  private nodeId: string;
  private nodeName: string;
  private body: string;
  private requestHeader: Map<string, Header> = new Map();
  private requestParam: Map<string, string> = new Map();
  private responseHeader: Map<string, string> = new Map();
  private outputResponseBody: string;
  private circuitBreaker: CircuitBreaker<any[], any>;

  // 添加初始化方法
  initialize(
    nodeId: string,
    body: string,
    requestHeader?: Map<string, Header[]>,
    requestParam?: Map<string, string>,
    responseHeader?: Map<string, string>,
  ) {
    this.nodeId = nodeId;
    this.body = body;
    this.requestHeader = requestHeader || new Map();
    this.requestParam = requestParam || new Map();
    this.responseHeader = responseHeader || new Map();
  }

  /**
   * 执行HTTP请求
   */
  async call(): Promise<void> {
    try {
      // 构建URL
      const url = this.changeUrlWhenPathVariable('https://api.btstu.cn/tst/api.php?text=%E4%BD%A0%E5%A5%BD');
      const urlWithParams = HttpUtil.makeUrlWithParams(
        url,
        this.getRequestParam(),
      );

      // 构建请求头
      // 如果需要支持多值header
      const headerMap = new Map<string, Header[]>();
      this.requestHeader.forEach((value, key) => {
        const existingValues = headerMap.get(key) || [];
        headerMap.set(key, [...existingValues, value]);
      });

      // 定义请求执行函数
      const runnable = async (): Promise<void> => {
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
            throw new Error(`状态码=${responseCode},响应体=${responseData}`);
          }

          // 设置响应体
          this.setOutputResponseBody(
            typeof responseData === 'string'
              ? responseData
              : JSON.stringify(responseData),
          );
        } catch (error) {
          this.logger.error(
            `failed to request ${urlWithParams}, nodeId = ${this.getNodeId()}`,
            error,
          );
          throw new ServiceUnavailableException(
            `请求节点[${this.getNodeName()}]失败,URL=${urlWithParams},msg=${error.message}`,
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
              `failed to request ${urlWithParams}, nodeId = ${this.getNodeId()}, because it is in FUSED state`,
              error,
            );
            throw new ServiceUnavailableException(
              `请求节点[${this.getNodeName()}]失败,URL=${urlWithParams},msg=接口已熔断`,
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
        `请求节点[${this.getNodeName()}]失败,msg=${error.message}`,
      );
    }
  }

  /**
   * 处理路径变量的URL变更
   */
  changeUrlWhenPathVariable(url: string): string {
    return url;
  }

  // Getters and Setters
  getNodeId(): string {
    return this.nodeId;
  }

  getNodeName(): string {
    return this.nodeName;
  }

  setNodeName(nodeName: string): void {
    this.nodeName = nodeName;
  }

  getRequestHeader(): Map<string, Header> {
    return this.requestHeader;
  }

  setRequestHeader(requestHeader: Map<string, Header>): void {
    this.requestHeader = requestHeader;
  }

  getRequestParam(): Map<string, string> {
    return this.requestParam;
  }

  setRequestParam(requestParam: Map<string, string>): void {
    this.requestParam = requestParam;
  }

  getResponseHeader(): Map<string, string> {
    return this.responseHeader;
  }

  setResponseHeader(responseHeader: Map<string, string>): void {
    this.responseHeader = responseHeader;
  }

  getOutputResponseBody(): string {
    return this.outputResponseBody;
  }

  setOutputResponseBody(outputResponseBody: string): void {
    this.outputResponseBody = outputResponseBody;
  }
}
