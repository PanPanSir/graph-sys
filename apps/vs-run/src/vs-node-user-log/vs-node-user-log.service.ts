import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';

// Interfaces
interface VsNodeUserLogSaveReq {
  msgId: string;
  nodeId: string;
  nodeName: string;
  userLogStr: string;
  requestTime: DateTime;
  createTime: DateTime;
}

interface LogServiceFacade {
  saveVsNodeUserLog(logs: VsNodeUserLogSaveReq[]): Promise<boolean>;
}

interface RefreshConfig {
  // 配置相关属性
}

// Exception class
class VsAdapterException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VsAdapterException';
  }
}

// Constants
const ZONE_ID_SH = 'Asia/Shanghai';

/**
 * 节点用户日志服务 - NestJS版本
 * 从Java VsNodeUserLogService转换而来
 */
@Injectable()
export class VsNodeUserLogService {
  private readonly logger = new Logger(VsNodeUserLogService.name);

  /**
   * 批量保存日志的最大批大小
   */
  private static readonly MAX_SAVE_LOG_BATCH_SIZE = 7500;

  /**
   * 成功日志的队列
   */
  private readonly blockingQueue: VsNodeUserLogSaveReq[] = [];
  private readonly maxQueueSize = 7500 * 10;

  constructor(
    private readonly logServiceFacade: LogServiceFacade,
    private readonly refreshConfig: RefreshConfig,
  ) {}

  /**
   * 获取队列
   */
  getQueue(): VsNodeUserLogSaveReq[] {
    return this.blockingQueue;
  }

  /**
   * 持久化节点用户日志
   */
  persistVsNodeUserLog(
    msgId: string,
    nodeId: string,
    nodeName: string,
    userLogStr: string,
    requestTime: DateTime,
  ): void {
    const logReq: VsNodeUserLogSaveReq = {
      msgId: '',
      nodeId: '',
      nodeName: '',
      userLogStr: '',
      requestTime: DateTime.now(),
      createTime: DateTime.now(),
    };

    try {
      logReq.msgId = msgId;
      logReq.nodeId = nodeId;
      logReq.nodeName = nodeName;
      logReq.userLogStr = userLogStr;
      const now = DateTime.now().setZone(ZONE_ID_SH);
      logReq.requestTime = requestTime;
      logReq.createTime = now;
    } catch (ex) {
      this.logger.error(
        `parse log failed, VsNodeUserLogSaveReq = ${JSON.stringify(logReq)}`,
        ex,
      );
    } finally {
      this.addLog(logReq);
    }
  }

  /**
   * 添加日志到队列
   */
  addLog(req: VsNodeUserLogSaveReq): void {
    try {
      if (this.blockingQueue.length < this.maxQueueSize) {
        this.blockingQueue.push(req);
      } else {
        this.logger.warn('Queue is full, dropping log entry');
      }
    } catch (ex) {
      this.logger.error(`add log failed, data = ${JSON.stringify(req)}`, ex);
    }
  }

  /**
   * 定时保存日志
   * 每3秒执行一次
   */
  @Cron('*/3 * * * * *')
  async saveLog(): Promise<void> {
    try {
      if (this.blockingQueue.length === 0) {
        return;
      }

      const curData: VsNodeUserLogSaveReq[] = [];

      // 从队列中取出最多MAX_SAVE_LOG_BATCH_SIZE条记录
      for (let i = 0; i < VsNodeUserLogService.MAX_SAVE_LOG_BATCH_SIZE; i++) {
        const curLog = this.blockingQueue.shift();
        if (curLog) {
          curData.push(curLog);
        } else {
          break;
        }
      }

      if (curData.length === 0) {
        return;
      }

      const saveSuccess =
        await this.logServiceFacade.saveVsNodeUserLog(curData);
      if (!saveSuccess) {
        this.logger.error(
          `save VsNodeUserLogSaveReq failed, data size = ${curData.length}`,
        );
        throw new VsAdapterException('save VsNodeUserLogSaveReq failed');
      }
    } catch (ex) {
      this.logger.error('save VsNodeUserLogSaveReq failed', ex);
    }
  }
}

// 导出相关类型和异常
export {
  VsNodeUserLogSaveReq,
  LogServiceFacade,
  RefreshConfig,
  VsAdapterException,
};
