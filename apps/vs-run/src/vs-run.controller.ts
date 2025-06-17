/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Body,
  Query,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import { VsProjectService } from './vs-project/vs-project.service';
import { FlowNodeUtil } from '@app/utils/vs/flow-node.util';
import { CheckUtil, VsHttpMethodEnum } from './utils/checkUtils';
import { HttpUtil } from './utils/httpUtils';
import { DateTimeUtil } from '@app/utils/vs/date-time-util';
import { VsNodeUserLogService } from './vs-node-user-log/vs-node-user-log.service';
import { FlowNodeTask } from '@app/utils/vs/flow-node-task';

// Enums
class VsAdapterException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

// Constants
const HEADER_IDEMPOTENT_ID = 'X-Idempotent-Id';
const HEADER_REQUEST_TIME = 'X-Request-Time';
const HEADER_ANTI_REPLAY_NONCE = 'X-Anti-Replay-Nonce';
const HEADER_ANTI_REPLAY_TIMESTAMP = 'X-Anti-Replay-Timestamp';
const MAX_DEPTH = 256;
const ZONE_ID_SH = 'Asia/Shanghai';

@Controller('vsAdapter')
export class VsAdapterController {
  constructor(
    @Inject('VsProjectService')
    private readonly vsProjectService: VsProjectService,
    // @Inject('VsNodeEntryLogService')
    // private readonly vsNodeEntryLogService: VsNodeEntryLogService,
    // @Inject('VsNodeExceptionLogService')
    // private readonly vsNodeExceptionLogService: VsNodeExceptionLogService,
    // @Inject('VsNodeResponseLogService')
    // private readonly vsNodeResponseLogService: VsNodeResponseLogService,
    @Inject('VsNodeUserLogService')
    private readonly vsNodeUserLogService: VsNodeUserLogService,
  ) {}

  @Post('**')
  @Get('**')
  async vsAdapter(
    @Req() request: Request,
    @Res() response: Response,
    @Query() requestParam: Record<string, string>,
    @Body() requestBody: string,
    @Headers(HEADER_IDEMPOTENT_ID) msgId: string,
  ) {
    let contextPath: string;
    let contentType: string;
    let responseHeader: Map<string, string>;
    let method: VsHttpMethodEnum;
    let requestHeader: Map<string, string>;
    let systemHeader: Map<string, string>;
    let responseEntity: any;
    const requestTime = this.getRequestTime(request);

    // 提前统一处理,避免在全局捕获异常器分散处理
    // eslint-disable-next-line prefer-const
    contextPath = request.url;
    // eslint-disable-next-line prefer-const
    contentType = request.get('Content-Type');
    // use case-insensitive map for process response header
    // eslint-disable-next-line prefer-const
    responseHeader = new Map<string, string>();
    // eslint-disable-next-line prefer-const
    method = this.getVsHttpMethod(request.method);
    // use case-insensitive map for process request header
    // eslint-disable-next-line prefer-const
    requestHeader = HttpUtil.makeRequestHeaderMap(request);
    // eslint-disable-next-line prefer-const
    systemHeader = this.getSystemHeader(requestHeader);

    // Copy system headers to response header
    systemHeader.forEach((value, key) => {
      responseHeader.set(key, value);
    });

    if (contentType) {
      if (
        contentType.includes('application/json') ||
        contentType.includes('application/xml') ||
        contentType.includes('text/plain')
      ) {
        responseEntity = await this.vsAdapterRaw(
          contextPath,
          requestBody,
          requestHeader,
          new Map(Object.entries(requestParam)),
          responseHeader,
          method,
          systemHeader,
          msgId,
          requestTime,
        );
      } else {
        throw new VsAdapterException(
          `不支持的Content-Type类型,当前值为[${contentType}]`,
        );
      }
    } else {
      // 只有GET才可能没有Content-Type
      if (request.method.toUpperCase() === 'GET') {
        responseEntity = await this.vsAdapterRaw(
          contextPath,
          null,
          requestHeader,
          new Map(Object.entries(requestParam)),
          responseHeader,
          method,
          systemHeader,
          msgId,
          requestTime,
        );
      } else {
        throw new VsAdapterException(
          `[${request.method}]请求必须要传递Content-Type请求头`,
        );
      }
    }

    return responseEntity;
  }

  /**
   * application/json、application/xml和text/plain格式
   */
  async vsAdapterRaw(
    contextPath: string,
    requestBody: string,
    requestHeader: Map<string, string>,
    requestParam: Map<string, string>,
    responseHeader: Map<string, string>,
    method: VsHttpMethodEnum,
    systemHeader: Map<string, string>,
    msgId: string,
    requestTime: DateTime,
  ) {
    try {
      return await this.process(
        contextPath,
        requestBody,
        requestHeader,
        requestParam,
        responseHeader,
        method,
        systemHeader,
        msgId,
        requestTime,
      );
    } catch (e) {
      throw new VsAdapterException(e.message);
    }
  }

  private async process(
    contextPath: string,
    requestBody: string,
    requestHeader: Map<string, string>,
    requestParam: Map<string, string>,
    responseHeader: Map<string, string>,
    method: VsHttpMethodEnum,
    systemHeader: Map<string, string>,
    msgId: string,
    requestTime: DateTime,
  ) {
    // 根据contextPath获取项目ID、以及节点、边、以及字节码信息
    const vsExecFlow = await this.vsProjectService.getProjectFlow(contextPath);
    CheckUtil.validateHttpMethod(vsExecFlow, method);

    // 构建流上节点实例
    const queue = this.vsNodeUserLogService.getQueue();
    const startFlowNode = FlowNodeUtil.makeRtFlow(
      requestBody,
      requestHeader,
      requestParam,
      responseHeader,
      vsExecFlow,
      queue,
    );

    try {
      // this.vsNodeEntryLogService.persistVsNodeEntryLog(
      //   msgId,
      //   contextPath,
      //   method,
      //   requestHeader,
      //   requestParam,
      //   requestBody,
      //   null,
      //   null,
      //   null,
      //   startFlowNode.nodeId,
      //   null,
      //   requestTime,
      // );

      // 执行流并获取结果
      const resultFlowNodeTask = this.processFlow(
        startFlowNode,
        msgId,
        contextPath,
        method,
        requestTime,
      );
      const resultBody = resultFlowNodeTask.outputResponseBody;
      const resultHeader = resultFlowNodeTask.responseHeader;

      const responseEntity = this.rewriteResponse(
        resultBody,
        resultHeader,
        systemHeader,
      );
      // this.vsNodeResponseLogService.persistVsNodeResponseLog(
      //   msgId,
      //   contextPath,
      //   method,
      //   requestHeader,
      //   requestParam,
      //   requestBody,
      //   responseHeader,
      //   responseEntity.body,
      //   null,
      //   null,
      //   null,
      //   null,
      //   null,
      //   requestTime,
      // );
      // 返回响应
      return responseEntity;
    } catch (tw) {
      // this.vsNodeExceptionLogService.persistVsNodeExceptionLog(
      //   msgId,
      //   contextPath,
      //   method,
      //   requestHeader,
      //   requestParam,
      //   requestBody,
      //   tw.message,
      //   null,
      //   null,
      //   null,
      //   null,
      //   null,
      //   requestTime,
      // );
      throw tw;
    }
  }

  /**
   * @param result
   * @param resultHeader
   * @param systemHeader used for keep system header value
   * @return
   */
  private rewriteResponse(
    result: string,
    resultHeader: Map<string, string>,
    systemHeader: Map<string, string>,
  ) {
    // set response header
    const headers: Record<string, string> = {};

    // add system header
    systemHeader.forEach((value, key) => {
      headers[key] = value;
    });

    headers['Content-Type'] = 'application/json';

    resultHeader.forEach((value, key) => {
      if (this.isSystemHeader(key)) {
        // system header can not be over-write
        return;
      } else {
        headers[key] = value;
      }
    });

    return {
      statusCode: 200,
      headers,
      body: result,
    };
  }

  private isSystemHeader(key: string): boolean {
    return (
      HEADER_IDEMPOTENT_ID.toLowerCase() === key.toLowerCase() ||
      HEADER_REQUEST_TIME.toLowerCase() === key.toLowerCase() ||
      HEADER_ANTI_REPLAY_NONCE.toLowerCase() === key.toLowerCase() ||
      HEADER_ANTI_REPLAY_TIMESTAMP.toLowerCase() === key.toLowerCase()
    );
  }

  private getVsHttpMethod(method: string): VsHttpMethodEnum {
    if (method.toUpperCase() === 'GET') {
      return VsHttpMethodEnum.GET;
    } else if (method.toUpperCase() === 'POST') {
      return VsHttpMethodEnum.POST;
    } else {
      throw new VsAdapterException(
        `不支持的请求方式,当前请求方式为[${method}]`,
      );
    }
  }

  private getSystemHeader(
    requestHeader: Map<string, string>,
  ): Map<string, string> {
    const systemHeader = new Map<string, string>();
    systemHeader.set(
      HEADER_IDEMPOTENT_ID,
      requestHeader.get(HEADER_IDEMPOTENT_ID),
    );
    systemHeader.set(
      HEADER_REQUEST_TIME,
      requestHeader.get(HEADER_REQUEST_TIME),
    );
    systemHeader.set(
      HEADER_ANTI_REPLAY_NONCE,
      requestHeader.get(HEADER_ANTI_REPLAY_NONCE),
    );
    systemHeader.set(
      HEADER_ANTI_REPLAY_TIMESTAMP,
      requestHeader.get(HEADER_ANTI_REPLAY_TIMESTAMP),
    );
    return systemHeader;
  }

  /**
   * @param start the beginning node
   * @return return node contains the result, including request header/param/body and response header/body
   */
  processFlow(
    start: FlowNodeTask,
    msgId: string,
    contextPath: string,
    method: VsHttpMethodEnum,
    requestTime: DateTime,
  ): FlowNodeTask {
    let loopCnt = 0;
    let curNode = start;

    while (true) {
      loopCnt++;
      if (loopCnt > MAX_DEPTH) {
        console.error(
          `the task path overflow, current path is ${loopCnt}, max path = ${MAX_DEPTH}`,
        );
        throw new Error(`执行流路径长度不能超过${MAX_DEPTH}`);
      }

      // 记录节点入口日志
      let nextNode: FlowNodeTask = null;
      // let entryLogSaveReq: VsNodeEntryLogSaveReq = null;

      try {
        // entryLogSaveReq = this.vsNodeEntryLogService.makeVsNodeEntryLog(
        //   msgId,
        //   contextPath,
        //   method,
        //   curNode.requestHeader,
        //   curNode.requestParam,
        //   curNode.inputRequestBody,
        //   curNode.nodeId,
        //   curNode.nodeName,
        //   curNode.taskType,
        //   null,
        //   null,
        //   requestTime,
        // );

        curNode.call();

        const activatedNode = curNode.activatedNodeId;
        const childNodes = curNode.childNodes;

        if (childNodes == null) {
          // 表明当前节点为结束节点
          break;
        }

        nextNode = childNodes.get(activatedNode);
        if (nextNode == null) {
          // update next prop
          // entryLogSaveReq.setNextNodeId(null);
          // entryLogSaveReq.setNextNodeName(null);
          console.error(
            `can not find activated child node, currNode = ${curNode}, activateNodeId = ${activatedNode}`,
          );
          throw new Error(
            `无法获取激活的子节点,当前节点为[${curNode.nodeName}]`,
          );
        }
        // update next prop
        // entryLogSaveReq.setNextNodeId(nextNode.nodeId);
        // entryLogSaveReq.setNextNodeName(nextNode.nodeName);
      } catch (tw) {
        console.error(
          `failed execute node task, current node task ${curNode}`,
          tw,
        );
        // this.vsNodeExceptionLogService.persistVsNodeExceptionLog(
        //   msgId,
        //   contextPath,
        //   method,
        //   curNode.requestHeader,
        //   curNode.requestParam,
        //   curNode.inputRequestBody,
        //   tw.message,
        //   curNode.nodeId,
        //   curNode.nodeName,
        //   curNode.taskType,
        //   null,
        //   null,
        //   requestTime,
        // );
        throw tw;
      } finally {
        // this.vsNodeEntryLogService.persistVsNodeEntryLog(entryLogSaveReq);
      }

      // 表明节点执行成功,记录节点响应日志
      // this.vsNodeResponseLogService.persistVsNodeResponseLog(
      //   msgId,
      //   contextPath,
      //   method,
      //   curNode.requestHeader,
      //   curNode.requestParam,
      //   curNode.inputRequestBody,
      //   curNode.responseHeader,
      //   curNode.outputResponseBody,
      //   curNode.nodeId,
      //   curNode.nodeName,
      //   curNode.taskType,
      //   nextNode.nodeId,
      //   nextNode.nodeName,
      //   requestTime,
      // );

      nextNode.inputRequestBody = curNode.outputRequestBody;
      nextNode.inputResponseBody = curNode.outputResponseBody;
      nextNode.flowCtx = curNode.flowCtx;
      curNode = nextNode;
    }

    // 记录最后一个节点的响应日志
    // this.vsNodeResponseLogService.persistVsNodeResponseLog(
    //   msgId,
    //   contextPath,
    //   method,
    //   curNode.requestHeader,
    //   curNode.requestParam,
    //   curNode.inputRequestBody,
    //   curNode.responseHeader,
    //   curNode.outputResponseBody,
    //   curNode.nodeId,
    //   curNode.nodeName,
    //   curNode.taskType,
    //   null,
    //   null,
    //   requestTime,
    // );

    return curNode;
  }

  /**
   * 从请求头获取时间戳 yyyy-MM-dd HH:mm:ss 格式
   */
  private getRequestTime(request: Request): DateTime {
    const headerReqTimeStr = request.get(HEADER_REQUEST_TIME);
    try {
      if (headerReqTimeStr) {
        return DateTime.fromFormat(
          headerReqTimeStr,
          DateTimeUtil.YYYY_MM_dd_HH_mm_ss,
        );
      }
    } catch (ignored) {
      // Ignore parsing exceptions and use default value.
    }

    return DateTime.now().setZone(ZONE_ID_SH);
  }
}
