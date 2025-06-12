import { Injectable, Logger } from '@nestjs/common';
import { CircuitBreaker } from 'opossum';
import { Response } from 'express';
import { Queue } from 'bull';
import { VsNodeTaskTypeEnum } from '@app/enum/node.enum';
import { VsDataConvRT } from './VsDataConvRT';
import { VsNodeUserLogSaveReq } from 'apps/vs-adapter/src/node/dto/node-user-log-save-req';
import { VsExecContext } from './VsExecContext';
import { DateTimeUtil } from './date-time-util';
import { XApiConstants } from 'libs/constants/x-api.constants';

/**
 * !!! ATTENTION !!!
 * DO NOT MODIFY ANY CHARACTERS IN THIS FILE.
 */
@Injectable()
export class FlowNodeTask {
  private readonly logger = new Logger(FlowNodeTask.name);

  /**
   * node unique id
   */
  nodeId: string;

  nodeName: string;

  taskType: VsNodeTaskTypeEnum;

  /**
   * child nodes
   * Notice: only one child node path will be activated.
   * If no child node, MUST set this to null.
   */
  childNodes: Map<string, FlowNodeTask> = new Map();

  // --------------------- dynamic set when run ---------------------
  activatedNodeId: string;

  // 请求参数、请求头 透传
  // 响应参数透传 shared by execute flow
  requestHeader: Map<string, string>;
  requestParam: Map<string, string>;
  responseHeader: Map<string, string>;
  // 熔断器
  circuitBreaker: CircuitBreaker<any[], any>;
  // 映射关系表
  dataConvRT: VsDataConvRT;

  // global context, for the same project, a lifecycle that acts on all instances of the execution flow for project
  ctx: VsExecContext;

  // origin request body, can not modify!
  body: string;

  // previous node output** as current node input**
  inputRequestBody: string;
  inputResponseBody: string;
  // current node output** as next node input**
  outputRequestBody: string;
  outputResponseBody: string;

  // 运行流上下文，生命周期在运行流范围，每次请求都会产生新的运行流
  flowCtx: Map<string, any>;

  // SSE emitter for real-time communication
  sseEmitter: Response;
  // indicate data is or not completed, false by default
  private _hasMoreData: boolean = false;
  // --------------------- dynamic set when run ---------------------

  // store use log
  blockingQueue: Queue<VsNodeUserLogSaveReq>;

  constructor(
    nodeId?: string,
    body?: string,
    requestHeader?: Map<string, string>,
    requestParam?: Map<string, string>,
    responseHeader?: Map<string, string>,
    circuitBreaker?: CircuitBreaker<any[], any>,
  ) {
    if (nodeId) {
      this.nodeId = nodeId;
      this.body = body;
      this.requestHeader = requestHeader || new Map();
      this.requestParam = requestParam || new Map();
      this.responseHeader = responseHeader || new Map();
      this.circuitBreaker = circuitBreaker;
    }
  }

  call(): void {
    // 默认不改变body直接传出去
    this.setOutputRequestBody(this.getInputRequestBody());
    this.setOutputResponseBody(this.getInputResponseBody());

    const childNodes = this.getChildNodes();
    if (!childNodes || childNodes.size === 0) {
      return; // do nothing, because this is endNode
    } else {
      if (childNodes.size === 1) {
        // 如果只有1个子节点,则激活
        const firstEntry = childNodes.entries().next().value;
        const key = firstEntry[0];
        this.setActivatedNodeId(key);
        return; // do nothing
      } else if (childNodes.size > 1) {
        // 多个子节点,则需要重写该方法
        this.logger.error(
          `current node ${this.getNodeName()},${this.getNodeId()} exists > 1 child nodes, should override call() method`,
        );
        throw new Error(
          `当前节点[${this.getNodeId()}]存在多个子节点,需要进行处理`,
        );
      } else {
        // 没有子节点,数据存在问题
        this.logger.error(
          `current node ${this.getNodeName()},${this.getNodeId()} exists 0 child nodes, should override call() method`,
        );
        throw new Error(
          `当前节点[${this.getNodeId()}]不存在子节点,需要进行处理`,
        );
      }
    }
  }

  hasMoreData(): boolean {
    return this._hasMoreData;
  }

  enableMoreData(): void {
    this._hasMoreData = true;
  }

  disableMoreData(): void {
    this._hasMoreData = false;
  }

  // 记录日志
  LOG(userLogStr: string): void {
    if (!this.blockingQueue) {
      return;
    }
    const logReq = new VsNodeUserLogSaveReq();
    try {
      logReq.nodeId = this.nodeId;
      logReq.nodeName = this.nodeName;
      logReq.taskType = this.taskType;
      logReq.userLogStr = userLogStr;
      const now = new Date();
      logReq.createTime = now;

      const msgId = this.requestHeader.get(XApiConstants.HEADER_IDEMPOTENT_ID);
      logReq.msgId = msgId;
      let requestTime = now;
      const headerReqTimeStr = this.requestHeader.get(
        XApiConstants.HEADER_REQUEST_TIME,
      );
      try {
        if (headerReqTimeStr && headerReqTimeStr.trim()) {
          requestTime = DateTimeUtil.parseDateTime(headerReqTimeStr);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (ignored) {
        // Ignore parsing exceptions and use default value.
      }
      logReq.requestTime = requestTime;
    } catch (ex) {
      this.logger.error(
        'parse log failed, requestHeader = {}',
        this.requestHeader,
        ex,
      );
    } finally {
      try {
        this.blockingQueue.add(logReq);
      } catch (ex) {
        this.logger.error('add userLog failed, data = {}', logReq, ex);
      }
    }
  }

  toString(): string {
    return `FlowNodeTask{nodeId='${this.nodeId}', nodeName='${this.nodeName}', taskType=${this.taskType}}`;
  }

  // Getters and Setters
  getNodeId(): string {
    return this.nodeId;
  }

  setNodeId(nodeId: string): void {
    this.nodeId = nodeId;
  }

  getNodeName(): string {
    return this.nodeName;
  }

  setNodeName(nodeName: string): void {
    this.nodeName = nodeName;
  }

  getTaskType(): VsNodeTaskTypeEnum {
    return this.taskType;
  }

  setTaskType(taskType: VsNodeTaskTypeEnum): void {
    this.taskType = taskType;
  }

  getChildNodes(): Map<string, FlowNodeTask> {
    return this.childNodes;
  }

  setChildNodes(childNodes: Map<string, FlowNodeTask>): void {
    this.childNodes = childNodes;
  }

  getActivatedNodeId(): string {
    return this.activatedNodeId;
  }

  setActivatedNodeId(activatedNodeId: string): void {
    this.activatedNodeId = activatedNodeId;
  }

  getRequestHeader(): Map<string, string> {
    return this.requestHeader;
  }

  setRequestHeader(requestHeader: Map<string, string>): void {
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

  getCircuitBreaker(): CircuitBreaker<any[], any> {
    return this.circuitBreaker;
  }

  setCircuitBreaker(circuitBreaker: CircuitBreaker<any[], any>): void {
    this.circuitBreaker = circuitBreaker;
  }

  getDataConvRT(): VsDataConvRT {
    return this.dataConvRT;
  }

  setDataConvRT(dataConvRT: VsDataConvRT): void {
    this.dataConvRT = dataConvRT;
  }

  getCtx(): VsExecContext {
    return this.ctx;
  }

  setCtx(ctx: VsExecContext): void {
    this.ctx = ctx;
  }

  getBody(): string {
    return this.body;
  }

  setBody(body: string): void {
    this.body = body;
  }

  getInputRequestBody(): string {
    return this.inputRequestBody;
  }

  setInputRequestBody(inputRequestBody: string): void {
    this.inputRequestBody = inputRequestBody;
  }

  getInputResponseBody(): string {
    return this.inputResponseBody;
  }

  setInputResponseBody(inputResponseBody: string): void {
    this.inputResponseBody = inputResponseBody;
  }

  getOutputRequestBody(): string {
    return this.outputRequestBody;
  }

  setOutputRequestBody(outputRequestBody: string): void {
    this.outputRequestBody = outputRequestBody;
  }

  getOutputResponseBody(): string {
    return this.outputResponseBody;
  }

  setOutputResponseBody(outputResponseBody: string): void {
    this.outputResponseBody = outputResponseBody;
  }

  getFlowCtx(): Map<string, any> {
    return this.flowCtx;
  }

  setFlowCtx(flowCtx: Map<string, any>): void {
    this.flowCtx = flowCtx;
  }

  getSseEmitter(): Response {
    return this.sseEmitter;
  }

  setSseEmitter(sseEmitter: Response): void {
    this.sseEmitter = sseEmitter;
  }

  getBlockingQueue(): Queue<VsNodeUserLogSaveReq> {
    return this.blockingQueue;
  }

  setBlockingQueue(blockingQueue: Queue<VsNodeUserLogSaveReq>): void {
    this.blockingQueue = blockingQueue;
  }
}
