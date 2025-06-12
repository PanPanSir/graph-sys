import { FlowService } from '../src/flow/flow.service';

async function testFlowService() {
  console.log('开始测试 FlowService...');

  // 创建测试实例
  const requestHeader = new Map([['Content-Type', 'application/json']]);
  const requestParam = new Map([['test', 'value']]);

  const service = new FlowService(
    'test-node-123',
    JSON.stringify({
      url: 'https://jsonplaceholder.typicode.com/posts/1', // 测试API
      method: 'GET',
    }),
    requestHeader,
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

// 运行测试
testFlowService();
