import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class VsLogService {
  private logQueue = new Subject();

  constructor() {
    // 设置定时处理队列中的日志
    setInterval(() => this.processLogs(), 3000);
  }

  async persistNodeEntryLog(logData: any) {
    this.logQueue.next({
      type: 'entry',
      data: logData,
    });
  }

  async persistNodeResponseLog(logData: any) {
    this.logQueue.next({
      type: 'response',
      data: logData,
    });
  }

  private async processLogs() {
    // 实现批量处理日志逻辑
  }
}
