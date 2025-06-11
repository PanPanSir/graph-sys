import { Injectable, Logger } from '@nestjs/common';
import { VsNodeUserLogSaveReq } from '../../apps/vs-adapter/src/node/dto/node-user-log-save-req';
import { DateTimeUtil } from '../utils/date-time-util';
import { Queue } from 'bullmq';
import { VsNodeTaskTypeEnum } from '@app/enum/node.enum';
/**
 * 外部API相关常量
 * 用于标准接口请求的参数定义和配置
 */
export class XApiConstants {

	// ---------------------------------- 请求头类型 ----------------------------------

	/**
		* 标准接口请求解析后的原始请求请求超时时间(单位:秒)
		*/
	public static readonly ORIGIN_REQUEST_TIMEOUT: number = 60;

	/**
		* 标准接口请求传递的body内容
		*/
	public static readonly ORIGIN_REQUEST_BODY: string = 'origin_request_body';

	// ---------------------------------- 标准接口请求通用参数 ----------------------------------

	/**
		* 对外暴露接口的系统参数
		*/

	/** 接口编码 */
	public static readonly API_CODE: string = 'x_api_code';

	/** 接口密钥key */
	public static readonly ACCESS_KEY: string = 'x_access_key';

	/** 接口访问时间,可选 */
	public static readonly TIMESTAMP: string = 'x_timestamp';

	/** 接口签名,可选 */
	public static readonly SIGN: string = 'x_sign';

	/** 发送方机构统一社会信用代码 */
	public static readonly SENDER_ORG_CODE: string = 'x_sender_org_code';

	/** 接收方机构统一社会信用代码(同时作为路由值) */
	public static readonly RECEIVER_ORG_CODE: string = 'x_receiver_org_code';

	/** 发送方产品编码 */
	public static readonly SENDER_APP_CODE: string = 'x_sender_app_code';

	/** 接收方产品编码 */
	public static readonly RECEIVER_APP_CODE: string = 'x_receiver_app_code';

	// ---------------------------------- HTTP请求头常量 ----------------------------------

	/**
		* 用于幂等的头
		*/
	public static readonly HEADER_IDEMPOTENT_ID: string = 'X-Msg-Id';

	/**
		* 请求时间
		*/
	public static readonly HEADER_REQUEST_TIME: string = 'X-Request-Time';

	/**
		* 用于防重放攻击的请求头,其值为调用方请求时的时间戳(ms为单位)
		*/
	public static readonly HEADER_ANTI_REPLAY_TIMESTAMP: string = 'X-Ca-Timestamp';

	/**
		* 用于防重放攻击的请求头,其值一般为调用方使用UUID生成
		*/
	public static readonly HEADER_ANTI_REPLAY_NONCE: string = 'X-Ca-Nonce';

	// ---------------------------------- 转发请求体相关常量 ----------------------------------

	/**
		* 转发请求体格式说明：
		* - application/json、application/xml和text/plain格式仅包括 FORWARD_REQUEST_RAW_BODY
		* - application/x-www-form-urlencoded格式仅包括 FORWARD_REQUEST_FORM_DATA_TEXT_BODY
		* - multipart/form-data 会包括 FORWARD_REQUEST_FORM_DATA_TEXT_BODY 和 FORWARD_REQUEST_FORM_DATA_BYTE_BODY
		*/

	/** 普通请求体内容 */
	public static readonly FORWARD_REQUEST_RAW_BODY: string = 'forward_request_normal_body';

	/** 表单数据文本内容 */
	public static readonly FORWARD_REQUEST_FORM_DATA_TEXT_BODY: string = 'forward_request_form_data_text_body';

	/** 表单数据二进制内容 */
	public static readonly FORWARD_REQUEST_FORM_DATA_BYTE_BODY: string = 'forward_request_form_data_byte_body';

	// ---------------------------------- 转发结果的结构 ----------------------------------

	/**
		* 转发结果状态码,200是正常,非200异常
		*/
	public static readonly FORWARD_RESULT_CODE: string = 'forward_result_code';

	/**
		* 转发结果数据
		*/
	public static readonly FORWARD_RESULT_DATA: string = 'forward_result_data';

	/**
		* 转发成功标识
		*/
	public static readonly FORWARD_SUCCESS: string = 'forward_success';
}

/**
* 导出常量对象，便于解构使用
*/
export const X_API_CONSTANTS = {
	// 超时配置
	ORIGIN_REQUEST_TIMEOUT: XApiConstants.ORIGIN_REQUEST_TIMEOUT,
	ORIGIN_REQUEST_BODY: XApiConstants.ORIGIN_REQUEST_BODY,

	// 标准接口参数
	API_CODE: XApiConstants.API_CODE,
	ACCESS_KEY: XApiConstants.ACCESS_KEY,
	TIMESTAMP: XApiConstants.TIMESTAMP,
	SIGN: XApiConstants.SIGN,
	SENDER_ORG_CODE: XApiConstants.SENDER_ORG_CODE,
	RECEIVER_ORG_CODE: XApiConstants.RECEIVER_ORG_CODE,
	SENDER_APP_CODE: XApiConstants.SENDER_APP_CODE,
	RECEIVER_APP_CODE: XApiConstants.RECEIVER_APP_CODE,

	// HTTP请求头
	HEADER_IDEMPOTENT_ID: XApiConstants.HEADER_IDEMPOTENT_ID,
	HEADER_REQUEST_TIME: XApiConstants.HEADER_REQUEST_TIME,
	HEADER_ANTI_REPLAY_TIMESTAMP: XApiConstants.HEADER_ANTI_REPLAY_TIMESTAMP,
	HEADER_ANTI_REPLAY_NONCE: XApiConstants.HEADER_ANTI_REPLAY_NONCE,

	// 转发请求体
	FORWARD_REQUEST_RAW_BODY: XApiConstants.FORWARD_REQUEST_RAW_BODY,
	FORWARD_REQUEST_FORM_DATA_TEXT_BODY: XApiConstants.FORWARD_REQUEST_FORM_DATA_TEXT_BODY,
	FORWARD_REQUEST_FORM_DATA_BYTE_BODY: XApiConstants.FORWARD_REQUEST_FORM_DATA_BYTE_BODY,

	// 转发结果
	FORWARD_RESULT_CODE: XApiConstants.FORWARD_RESULT_CODE,
	FORWARD_RESULT_DATA: XApiConstants.FORWARD_RESULT_DATA,
	FORWARD_SUCCESS: XApiConstants.FORWARD_SUCCESS,
} as const;

/**
* 类型定义：标准接口请求参数
*/
export interface StandardApiRequestParams {
	[XApiConstants.API_CODE]: string;
	[XApiConstants.ACCESS_KEY]: string;
	[XApiConstants.TIMESTAMP]?: string;
	[XApiConstants.SIGN]?: string;
	[XApiConstants.SENDER_ORG_CODE]: string;
	[XApiConstants.RECEIVER_ORG_CODE]: string;
	[XApiConstants.SENDER_APP_CODE]: string;
	[XApiConstants.RECEIVER_APP_CODE]: string;
}

/**
* 类型定义：转发请求体
*/
export interface ForwardRequestBody {
	[XApiConstants.FORWARD_REQUEST_RAW_BODY]?: string;
	[XApiConstants.FORWARD_REQUEST_FORM_DATA_TEXT_BODY]?: Record<string, string>;
	[XApiConstants.FORWARD_REQUEST_FORM_DATA_BYTE_BODY]?: Record<string, Buffer>;
}

/**
* 类型定义：转发结果
*/
export interface ForwardResult {
	[XApiConstants.FORWARD_RESULT_CODE]: number;
	[XApiConstants.FORWARD_RESULT_DATA]: any;
	[XApiConstants.FORWARD_SUCCESS]: boolean;
}

/**
* 类型定义：防重放攻击请求头
*/
export interface AntiReplayHeaders {
	[XApiConstants.HEADER_ANTI_REPLAY_TIMESTAMP]: string;
	[XApiConstants.HEADER_ANTI_REPLAY_NONCE]: string;
}
/**
 * !!! ATTENTION !!!
 * DO NOT MODIFY ANY CHARACTERS IN THIS FILE.
 *
 * 流程节点任务类 - NestJS版本
 * 用于处理流程图中的单个节点执行逻辑
 */
@Injectable()
export class FlowNodeTask {
  private readonly logger = new Logger(FlowNodeTask.name);

  /**
   * 节点唯一标识符
   */
  public nodeId: string;

  /**
   * 节点名称
   */
  public nodeName: string;

  /**
   * 任务类型枚举
   */
  public taskType: VsNodeTaskTypeEnum;

  /**
   * 子节点映射
   * 注意：只有一个子节点路径会被激活
   * 如果没有子节点，必须设置为null
   */
  public childNodes: Map<string, FlowNodeTask> = new Map();

  // --------------------- 运行时动态设置的属性 ---------------------

  /**
   * 被激活的节点ID（运行时设置）
   */
  public activatedNodeId: string;

  /**
   * 请求头信息（透传）
   */
  public requestHeader: Map<string, string>;

  /**
   * 请求参数（透传）
   */
  public requestParam: Map<string, string>;

  /**
   * 响应头信息（透传）
   */
  public responseHeader: Map<string, string>;

  /**
   * 熔断器实例
   */
  public circuitBreaker;

  /**
   * 数据转换运行时对象
   */
  public dataConvRT;

  /**
   * 全局执行上下文
   * 对于同一个项目，作用于项目所有执行流实例的生命周期
   */
  public ctx;

  /**
   * 原始请求体（不可修改）
   */
  public body: string;

  /**
   * 前一个节点的输出作为当前节点的输入
   */
  public inputRequestBody: string;
  public inputResponseBody: string;

  /**
   * 当前节点的输出作为下一个节点的输入
   */
  public outputRequestBody: string;
  public outputResponseBody: string;

  /**
   * 运行流上下文
   * 生命周期在运行流范围，每次请求都会产生新的运行流
   */
  public flowCtx: Map<string, any>;

  /**
   * Server-Sent Events 发射器
   */
  public sseEmitter;

  /**
   * 指示数据是否完成，默认为false
   */
  private _hasMoreData: boolean = false;

  // --------------------- 运行时动态设置的属性结束 ---------------------

  /**
   * 存储用户日志的队列
   */
  public blockingQueue: Queue<VsNodeUserLogSaveReq>;

  /**
   * 默认构造函数
   * 用于Jackson序列化
   */
  constructor() {
    // 初始化Map对象
    this.childNodes = new Map();
    this.requestHeader = new Map();
    this.requestParam = new Map();
    this.responseHeader = new Map();
    this.flowCtx = new Map();
  }

  /**
   * 带参数的构造函数
   * @param nodeId 节点ID
   * @param body 请求体
   * @param requestHeader 请求头
   * @param requestParam 请求参数
   * @param responseHeader 响应头
   */
  static create(
    nodeId: string,
    body: string,
    requestHeader: Map<string, string>,
    requestParam: Map<string, string>,
    responseHeader: Map<string, string>
  ): FlowNodeTask {
    const task = new FlowNodeTask();
    task.nodeId = nodeId;
    task.body = body;
    task.requestHeader = requestHeader;
    task.requestParam = requestParam;
    task.responseHeader = responseHeader;
    return task;
  }

  /**
   * 带熔断器的构造函数
   * @param nodeId 节点ID
   * @param body 请求体
   * @param requestHeader 请求头
   * @param requestParam 请求参数
   * @param responseHeader 响应头
   * @param circuitBreaker 熔断器
   */
  static createWithCircuitBreaker(
    nodeId: string,
    body: string,
    requestHeader: Map<string, string>,
    requestParam: Map<string, string>,
    responseHeader: Map<string, string>,
    circuitBreaker
  ): FlowNodeTask {
    const task = FlowNodeTask.create(nodeId, body, requestHeader, requestParam, responseHeader);
    task.circuitBreaker = circuitBreaker;
    return task;
  }

  /**
   * 执行节点任务的核心方法
   * 默认行为：不改变body直接传出去
   */
  public async call(): Promise<void> {
    // 默认不改变body直接传出去
    this.setOutputRequestBody(this.getInputRequestBody());
    this.setOutputResponseBody(this.getInputResponseBody());

    const childNodes = this.getChildNodes();
    if (!childNodes || childNodes.size === 0) {
      return; // 什么都不做，因为这是结束节点
    } else {
      if (childNodes.size === 1) {
        // 如果只有1个子节点，则激活
        const firstEntry = childNodes.entries().next().value;
        const key = firstEntry[0];
        this.setActivatedNodeId(key);
        return; // 什么都不做
      } else if (childNodes.size > 1) {
        // 多个子节点，则需要重写该方法
        this.logger.error(
          `current node ${this.getNodeName()},${this.getNodeId()} exists > 1 child nodes, should override call() method`
        );
        throw new Error(`当前节点[${this.getNodeId()}]存在多个子节点,需要进行处理`);
      } else {
        // 没有子节点，数据存在问题
        this.logger.error(
          `current node ${this.getNodeName()},${this.getNodeId()} exists 0 child nodes, should override call() method`
        );
        throw new Error(`当前节点[${this.getNodeId()}]不存在子节点,需要进行处理`);
      }
    }
  }

  /**
   * 检查是否还有更多数据
   * @returns 是否还有更多数据
   */
  public hasMoreData(): boolean {
    return this._hasMoreData;
  }

  /**
   * 启用更多数据标志
   */
  public enableMoreData(): void {
    this._hasMoreData = true;
  }

  /**
   * 禁用更多数据标志
   */
  public disableMoreData(): void {
    this._hasMoreData = false;
  }

  /**
   * 记录用户日志
   * @param userLogStr 用户日志字符串
   */
  public LOG(userLogStr: string): void {
    if (!this.blockingQueue) {
      return;
    }

    const logReq = new VsNodeUserLogSaveReq();
    try {
      logReq.nodeId = this.nodeId;
      logReq.nodeName = this.nodeName;
      logReq.taskType = this.taskType;
      logReq.userLogStr = userLogStr;
      const now = new Date(); // 使用JavaScript的Date对象
      logReq.createTime = now;

      const msgId = this.requestHeader.get(XApiConstants.HEADER_IDEMPOTENT_ID);
      logReq.msgId = msgId;
      let requestTime = now;
      const headerReqTimeStr = this.requestHeader.get(XApiConstants.HEADER_REQUEST_TIME);

      try {
        if (headerReqTimeStr && headerReqTimeStr.trim().length > 0) {
          requestTime = DateTimeUtil.parseDateTime(headerReqTimeStr);
        }
      } catch (ignored) {
        // 忽略解析异常，使用默认值
      }
      logReq.requestTime = requestTime;
    } catch (ex) {
      this.logger.error(`parse log failed, requestHeader = ${JSON.stringify(this.requestHeader)}`, ex);
    } finally {
      try {
        // 使用Bull队列的add方法
        this.blockingQueue.add('userLog', logReq);
      } catch (ex) {
        this.logger.error(`add userLog failed, data = ${JSON.stringify(logReq)}`, ex);
      }
    }
  }

  /**
   * 重写toString方法
   * @returns 对象的字符串表示
   */
  public toString(): string {
    return `FlowNodeTask{nodeId='${this.nodeId}', nodeName='${this.nodeName}', taskType=${this.taskType}}`;
  }

  // Getter和Setter方法
  public getNodeId(): string {
    return this.nodeId;
  }

  public setNodeId(nodeId: string): void {
    this.nodeId = nodeId;
  }

  public getNodeName(): string {
    return this.nodeName;
  }

  public setNodeName(nodeName: string): void {
    this.nodeName = nodeName;
  }

  public getTaskType(): VsNodeTaskTypeEnum {
    return this.taskType;
  }

  public setTaskType(taskType: VsNodeTaskTypeEnum): void {
    this.taskType = taskType;
  }

  public getChildNodes(): Map<string, FlowNodeTask> {
    return this.childNodes;
  }

  public setChildNodes(childNodes: Map<string, FlowNodeTask>): void {
    this.childNodes = childNodes;
  }

  public getActivatedNodeId(): string {
    return this.activatedNodeId;
  }

  public setActivatedNodeId(activatedNodeId: string): void {
    this.activatedNodeId = activatedNodeId;
  }

  public getRequestHeader(): Map<string, string> {
    return this.requestHeader;
  }

  public setRequestHeader(requestHeader: Map<string, string>): void {
    this.requestHeader = requestHeader;
  }

  public getRequestParam(): Map<string, string> {
    return this.requestParam;
  }

  public setRequestParam(requestParam: Map<string, string>): void {
    this.requestParam = requestParam;
  }

  public getResponseHeader(): Map<string, string> {
    return this.responseHeader;
  }

  public setResponseHeader(responseHeader: Map<string, string>): void {
    this.responseHeader = responseHeader;
  }

  public getCircuitBreaker() {
    return this.circuitBreaker;
  }

  public setCircuitBreaker(circuitBreaker): void {
    this.circuitBreaker = circuitBreaker;
  }

  public getDataConvRT() {
    return this.dataConvRT;
  }

  public setDataConvRT(dataConvRT): void {
    this.dataConvRT = dataConvRT;
  }

  public getCtx() {
    return this.ctx;
  }

  public setCtx(ctx): void {
    this.ctx = ctx;
  }

  public getBody(): string {
    return this.body;
  }

  public setBody(body: string): void {
    this.body = body;
  }

  public getInputRequestBody(): string {
    return this.inputRequestBody;
  }

  public setInputRequestBody(inputRequestBody: string): void {
    this.inputRequestBody = inputRequestBody;
  }

  public getInputResponseBody(): string {
    return this.inputResponseBody;
  }

  public setInputResponseBody(inputResponseBody: string): void {
    this.inputResponseBody = inputResponseBody;
  }

  public getOutputRequestBody(): string {
    return this.outputRequestBody;
  }

  public setOutputRequestBody(outputRequestBody: string): void {
    this.outputRequestBody = outputRequestBody;
  }

  public getOutputResponseBody(): string {
    return this.outputResponseBody;
  }

  public setOutputResponseBody(outputResponseBody: string): void {
    this.outputResponseBody = outputResponseBody;
  }

  public getFlowCtx(): Map<string, any> {
    return this.flowCtx;
  }

  public setFlowCtx(flowCtx: Map<string, any>): void {
    this.flowCtx = flowCtx;
  }

  public getSseEmitter() {
    return this.sseEmitter;
  }

  public setSseEmitter(sseEmitter): void {
    this.sseEmitter = sseEmitter;
  }

  public getBlockingQueue(): Queue<VsNodeUserLogSaveReq> {
    return this.blockingQueue;
  }

  public setBlockingQueue(blockingQueue: Queue<VsNodeUserLogSaveReq>): void {
    this.blockingQueue = blockingQueue;
  }
}