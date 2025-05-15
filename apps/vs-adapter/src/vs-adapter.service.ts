import { Injectable } from '@nestjs/common';
import { VsProjectService } from './services/vs-project.service';
import { VsLogService } from './services/vs-log.service';
import { CircuitBreaker } from 'circuit-breaker-js';

@Injectable()
export class VsAdapterService {
  private circuitBreaker: CircuitBreaker;

  constructor(
    private readonly vsProjectService: VsProjectService,
    private readonly vsLogService: VsLogService,
  ) {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 5000,
    });
  }

  async processRequest(request: {
    contextPath: string;
    method: string;
    body?: any;
    headers: any;
    query: any;
  }) {
    // 1. 获取项目流程配置
    const flow = await this.vsProjectService.getProjectFlow(
      request.contextPath,
    );

    // 2. 构建流程节点
    const startNode = this.buildFlowNode(flow, request);

    // 3. 执行流程
    return await this.processFlow(startNode);
  }

  private async processFlow(startNode: any) {
    // 实现流程处理逻辑
    return {
      body: {},
      headers: {},
    };
  }
}
