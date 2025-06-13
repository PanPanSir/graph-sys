import { Controller, Get } from '@nestjs/common';
import { FlowService } from './flow.service';

@Controller('flow')
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  @Get()
  async findAll() {
    console.log('开始测试 FlowService...');

    // 创建测试实例
    const headers: Map<string, { name: string; value: string }[]> = new Map();
    headers.set('Content-Type', [
      { name: 'Content-Type', value: 'application/json' },
    ]);
    headers.set('Authorization', [
      { name: 'Authorization', value: 'Bearer token1' },
      { name: 'Authorization', value: 'Bearer token2' },
    ]);
    const requestParam = new Map([['test', 'value']]);

    const service = new FlowService();
    service.initialize(
      'test-node-123',
      JSON.stringify({
        url: 'https://jsonplaceholder.typicode.com/posts/1', // 测试API
        method: 'GET',
      }),
      headers,
      requestParam,
    );

    try {
      await service.call();
      console.log('✅ 请求成功');
      console.log('响应体:', service.getOutputResponseBody());
    } catch (error) {
      console.error('❌ 请求失败:', error.message);
    }
  }
}
