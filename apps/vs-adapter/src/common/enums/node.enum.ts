export enum VsNodeTaskType {
  COMPOSITE_END = 'COMPOSITE_END', // 一图层："结束复合组件,用于前端渲染"),
  COMPOSITE_NORMAL = 'COMPOSITE_NORMAL', //一图层： "普通复合组件,用于前端渲染"),
  CONTEXT = 'CONTEXT', // 一图层："上下文组件,作为项目的开始"),
  END = 'END', //  二图层："结束原子组件,作为项目的结束"),
  HTTP = 'HTTP', //  一图层："HTTP组件"),
  ROUTE = 'ROUTE', // 二图层： 群消息过滤路由组件"),
  CONVERT = 'CONVERT', // 二图层： "纯脚本转换组件,只能写脚本"),
  DATA_MAPPING = 'DATA_MAPPING', // 二图层： "数据映射组件"),
}
export enum VsNodeViewType {
  COMPOSITE = 'COMPOSITE', // 复合节点，有第二图层，第二图层非空或者为空都可以
  ATOMIC = 'ATOMIC ', // 原子节点，包含一图层的HTTP、CONTEXT；二图层的END、ROUTE、CONVERT、DATA_MAPPING
}
export enum VIRTUAL_NODE_PORT_TYPE { // 虚拟端口类型
  VIRTUAL_INPUT = 'VIRTUAL_INPUT',
  VIRTUAL_OUTPUT = 'VIRTUAL_OUTPUT',
}
