import { VsHttpMethodEnum } from '@app/enum/port.enum';
import { FlowNodeTask } from './flow-node-task';
import { VsNode } from '../../node/entities/node.entity';
import { Flow } from './flow';

/**
 * 执行流接口 - 用于执行流程
 * 对应Java中的VsExecFlow
 */
export interface VsExecFlow {
	/** 项目ID */
	id?: number;

	/** 项目名称 */
	name?: string;

	/** 项目版本 */
	compileVersion?: number;

	/** 项目路径 */
	contextPath?: string;

	/** 项目的请求方法 */
	method?: VsHttpMethodEnum;

	/** 节点字节码映射 */
	nodeId2Class: Map<string, new() => FlowNodeTask>;

	/** 节点ID和节点映射 */
	nodeId2Node: Map<string, VsNode>;

	/** 节点ID和节点名字对应关系 */
	nodeId2NodeName: Map<string, string>;

	/** 节点ID和节点熔断器对应关系 */
	nodeId2CircuitBreaker: Map<string, any>;

	/** 节点ID和数据映射关系 */
	nodeId2GeneralDataConvMapping: Map<string, any>;

	/** 具体执行流,仅包含节点/边信息 */
	flow?: Flow;

	/** 项目对应的全局上下文,多个运行流共享 */
	ctx: VsExecContext;
}

/**
* 执行上下文接口
*/
export interface VsExecContext {
	requestId?: string;
	userId?: string;
	timestamp: number;
	[key: string]: any;
}

/**
* VsExecFlow工厂函数
*/
export function createVsExecFlow(data?: Partial<VsExecFlow>): VsExecFlow {
	return {
			nodeId2Class: new Map(),
			nodeId2Node: new Map(),
			nodeId2NodeName: new Map(),
			nodeId2CircuitBreaker: new Map(),
			nodeId2GeneralDataConvMapping: new Map(),
			ctx: {
					timestamp: Date.now()
			},
			...data
	};
}