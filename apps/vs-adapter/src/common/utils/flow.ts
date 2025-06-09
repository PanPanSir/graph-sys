import { FlowLink } from './flow-link';
import { FlowNode } from './flow-node';

export interface Flow {
	nodes: Set<FlowNode>;
	links: Set<FlowLink>;
}