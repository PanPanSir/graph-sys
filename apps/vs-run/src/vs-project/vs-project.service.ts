/* eslint-disable @typescript-eslint/no-unused-vars */
import { VsNodeTaskTypeEnum } from '@app/enum/node.enum';
import { VsHttpMethodEnum, VsPortTypeEnum } from '@app/enum/port.enum';
import { VsProjectStateEnum } from '@app/enum/project.enum';
import { FlowNodeUtil } from '@app/utils/vs/flow-node.util';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { VsLink } from 'apps/vs-adapter/src/link/entities/link.entity';
import { VsNode } from 'apps/vs-adapter/src/node/entities/node.entity';
import { VsNodeProp } from 'apps/vs-adapter/src/node/entities/node.prop.entity';
import { VsPortProp } from 'apps/vs-adapter/src/port/dto/VsPortProp';
import { VsPort } from 'apps/vs-adapter/src/port/entities/port.entity';
import { VsProject } from 'apps/vs-adapter/src/project/entities/project.entity';
// 异常类定义
export class VsAdapterException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VsAdapterException';
  }
}

export class VsDataConsistencyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VsDataConsistencyException';
  }
}

export interface VsPortPropHttp {
  slidingWindowSize: number;
  minimumNumberOfCalls: number;
  failureRateThreshold: number;
  keepOpenStateInSeconds: number;
  permittedNumberOfCallsInHalfOpenState: number;
  [key: string]: any;
}

export interface VsPortPropDataMapping {
  vsDataConvProp: VsDataConvProp;
  [key: string]: any;
}

export interface VsDataConvProp {
  [key: string]: any;
}

// 工具类接口定义
export interface Flow {
  [key: string]: any;
}

export interface FlowNodeTask {
  [key: string]: any;
}

export interface VsDataConvRT {
  [key: string]: any;
}

export interface CircuitBreaker {
  [key: string]: any;
}

export interface CircuitBreakerConfig {
  slidingWindowSize: number;
  minimumNumberOfCalls: number;
  failureRateThreshold: number;
  waitDurationInOpenState: number;
  permittedNumberOfCallsInHalfOpenState: number;
}

export interface VsExecFlow {
  id: number;
  name: string;
  compileVersion: number;
  contextPath: string;
  method: VsHttpMethodEnum;
  nodeId2Class: Map<string, any>;
  nodeId2Node: Map<string, VsNode>;
  nodeId2NodeName: Map<string, string>;
  nodeId2CircuitBreaker: Map<string, CircuitBreaker>;
  nodeId2GeneralDataConvMapping: Map<string, VsDataConvRT>;
  flow: Flow;
}

// 服务接口定义
export interface VsNodeService {
  list(query: any): Promise<VsNode[]>;
}

export interface VsLinkService {
  list(query: any): Promise<VsLink[]>;
}

export interface VsPortService {
  list(query: any): Promise<VsPort[]>;
}

export interface VsProjectRepository {
  findOne(query: any): Promise<VsProject | null>;
}

// 工具类接口定义
export interface CircuitBreakUtil {
  getCircuitBreakerConfig(
    slidingWindowSize: number,
    minimumNumberOfCalls: number,
    failureRateThreshold: number,
    waitDurationInOpenState: number,
    permittedNumberOfCallsInHalfOpenState: number,
  ): CircuitBreakerConfig;
}

// 常量定义
const CACHE_TTL_DAYS = 24 * 60 * 60 * 1000; // 1天的毫秒数
const MAX_CACHE_SIZE = 512;

@Injectable()
export class VsProjectService {
  private readonly logger = new Logger(VsProjectService.name);

  // 静态缓存，模拟Caffeine缓存
  private static readonly contextPathProjectFlowCache = new Map<
    string,
    VsExecFlow
  >();
  private static readonly cacheTimestamps = new Map<string, number>();

  constructor(
    @Inject('VsNodeService') private readonly vsNodeService: VsNodeService,
    @Inject('VsLinkService') private readonly vsLinkService: VsLinkService,
    @Inject('VsPortService') private readonly vsPortService: VsPortService,
    @Inject('VsProjectRepository')
    private readonly vsProjectRepository: VsProjectRepository,
    @Inject('CircuitBreakUtil')
    private readonly circuitBreakUtil: CircuitBreakUtil,
    // @Inject('VsDataConvertUtil')
    // private readonly vsDataConvertUtil: VsDataConvertUtil,
    @Inject('CircuitBreakerRegistry')
    private readonly circuitBreakerRegistry,
  ) {}

  // 根据上下文路径获取项目信息
  async getProjectFlow(contextPath: string): Promise<VsExecFlow> {
    const dbProject = await this.vsProjectRepository.findOne({
      where: { contextPath },
      select: ['id', 'name', 'method', 'state', 'compileVersion'],
    });

    // 无法找到对应的工程
    if (!dbProject) {
      this.logger.error(
        `Unable to find project corresponding to the context ${contextPath}`,
      );
      throw new VsAdapterException(
        `无法找到对应的项目进行执行,contextPath=${contextPath}`,
      );
    }

    // 项目已经下线
    if (dbProject.state === VsProjectStateEnum.OFFLINE) {
      this.logger.error(`context ${contextPath} project is offline`);
      throw new VsAdapterException(`项目已下线,contextPath=${contextPath}`);
    }

    const cacheProject = this.getCachedProject(contextPath);
    if (!cacheProject) {
      // 从DB查询
      return await this.slowGetProjectAndUpdateCache(dbProject, contextPath);
    } else {
      // 走缓存,对比版本,若版本不一致,则更新缓存
      const cacheVersion = cacheProject.compileVersion;
      const dbVersion = dbProject.compileVersion;
      if (dbVersion !== cacheVersion) {
        // 从DB查询
        return await this.slowGetProjectAndUpdateCache(dbProject, contextPath);
      } else {
        return cacheProject;
      }
    }
  }

  private getCachedProject(contextPath: string): VsExecFlow | null {
    const cached =
      VsProjectService.contextPathProjectFlowCache.get(contextPath);
    const timestamp = VsProjectService.cacheTimestamps.get(contextPath);

    if (cached && timestamp) {
      const now = Date.now();
      if (now - timestamp < CACHE_TTL_DAYS) {
        return cached;
      } else {
        // 缓存过期，清理
        VsProjectService.contextPathProjectFlowCache.delete(contextPath);
        VsProjectService.cacheTimestamps.delete(contextPath);
      }
    }

    return null;
  }

  private setCachedProject(contextPath: string, project: VsExecFlow): void {
    // 检查缓存大小限制
    if (VsProjectService.contextPathProjectFlowCache.size >= MAX_CACHE_SIZE) {
      // 清理最旧的缓存项
      const oldestKey = VsProjectService.cacheTimestamps.entries().next()
        .value?.[0];
      if (oldestKey) {
        VsProjectService.contextPathProjectFlowCache.delete(oldestKey);
        VsProjectService.cacheTimestamps.delete(oldestKey);
      }
    }

    VsProjectService.contextPathProjectFlowCache.set(contextPath, project);
    VsProjectService.cacheTimestamps.set(contextPath, Date.now());
  }

  private async slowGetProjectAndUpdateCache(
    vsProject: VsProject,
    contextPath: string,
  ): Promise<VsExecFlow> {
    const projectId = vsProject.id;
    const projectName = vsProject.name;
    const version = vsProject.compileVersion;
    const method = vsProject.method;

    // 获取所有边
    const links = await this.vsLinkService.list({
      where: { projectId },
      select: ['id', 'sourceId', 'targetId', 'sourcePort', 'targetPort'],
    });

    const ports = await this.vsPortService.list({
      where: { projectId },
      select: ['id', 'nodeId', 'type', 'properties'],
    });

    const nodes = await this.vsNodeService.list({
      where: { projectId },
      select: ['id', 'properties', 'viewType', 'taskType', 'classBytes'],
    });

    // key: node id, value: node name
    const nodeId2NodeName = new Map<string, string>();
    nodes.forEach((node) => {
      const nodeProp = node.properties;
      nodeId2NodeName.set(node.id, nodeProp.name);
    });

    // create the actual execute flow
    // key: link start node id, value: link
    const sourcePort2Link = new Map<string, VsLink>();
    links.forEach((link) => {
      sourcePort2Link.set(link.sourcePort, link);
    });

    // key: port id, value: port
    const portId2Port = new Map<string, VsPort>();
    ports.forEach((port) => {
      portId2Port.set(port.id, port);
    });

    // key: node id, value: node
    const nodeId2node = new Map<string, VsNode>();
    nodes.forEach((node) => {
      nodeId2node.set(node.id, node);
    });

    // only contains atomic node
    const atomicNodes = FlowNodeUtil.getActualNodes(nodes);

    // only contains actual execute link
    let actualLinks: VsLink[];
    try {
      actualLinks = FlowNodeUtil.getActualLinks(
        links,
        nodeId2node,
        portId2Port,
        sourcePort2Link,
        nodeId2NodeName,
      );
    } catch (e) {
      if (e instanceof VsDataConsistencyException) {
        throw new VsAdapterException(e.message);
      }
      throw e;
    }

    // 节点ID-节点(原子节点)
    const atomicNodeId2node = new Map<string, VsNode>();
    atomicNodes.forEach((node) => {
      atomicNodeId2node.set(node.id, node);
    });

    // 生成静态流
    const flow = FlowNodeUtil.makeStFlow(actualLinks, atomicNodes);
    let nodeIdsMap: Map<string, string[]>;
    try {
      nodeIdsMap = FlowNodeUtil.getNodeIdsMap(flow, nodeId2node);
    } catch (e) {
      if (e instanceof VsDataConsistencyException) {
        throw new VsAdapterException(e.message);
      }
      throw e;
    }
    const validNodeIds =
      nodeIdsMap.get(FlowNodeUtil.ALL_VALID_NODE_ID_KEY) || [];

    const nodeId2Class = new Map<string, any>();
    for (const validNodeId of validNodeIds) {
      const curValidNode = atomicNodeId2node.get(validNodeId);
      if (!curValidNode) {
        this.logger.error(
          `can not find node, nodeId =${validNodeId}, projectId = ${projectId}`,
        );
        throw new VsAdapterException(
          `工程[${projectName}]下无法找到节点[${nodeId2NodeName.get(validNodeId) || ''}],`,
        );
      }

      const classBytes = curValidNode.classBytes;
      if (!classBytes || classBytes.length === 0) {
        this.logger.error(
          `can not find node class bytes, nodeId =${validNodeId}, projectId = ${projectId}`,
        );
        throw new VsAdapterException(
          `工程[${projectName}]节点[${nodeId2NodeName.get(validNodeId) || ''}]任务为空`,
        );
      }

      let flowNodeTaskClass: any;
      try {
        flowNodeTaskClass = FlowNodeUtil.getClass(
          curValidNode.id,
          curValidNode.classBytes,
        );
      } catch (ex) {
        this.logger.error(
          `can not get node class meta, nodeId =${validNodeId}, projectId = ${projectId}`,
        );
        throw new VsAdapterException(
          `工程[${projectName}]节点[${nodeId2NodeName.get(validNodeId) || ''}]任务元数据信息加载失败`,
        );
      }
      nodeId2Class.set(curValidNode.id, flowNodeTaskClass);
    }

    // 生成熔断器(暂时只有HTTP组件存在)
    const nodeId2CircuitBreaker = this.getCircuitBreakerMap(
      nodeId2node,
      ports,
      projectName,
      nodeId2NodeName,
    );

    // 转换节点组件,数据映射关系配置
    const nodeId2GeneralDataConvMapping = this.getGeneralDataConvMappingMap(
      nodeId2node,
      ports,
      projectName,
      nodeId2NodeName,
    );

    // 组装结果
    const vsExecFlow: VsExecFlow = {
      id: projectId,
      name: projectName,
      compileVersion: version,
      contextPath,
      method,
      nodeId2Class,
      nodeId2Node: nodeId2node,
      nodeId2NodeName,
      nodeId2CircuitBreaker,
      nodeId2GeneralDataConvMapping,
      flow,
    };

    // 更新缓存并返回
    this.setCachedProject(contextPath, vsExecFlow);
    return vsExecFlow;
  }

  private getCircuitBreakerMap(
    nodeId2node: Map<string, VsNode>,
    ports: VsPort[],
    projectName: string,
    nodeId2NodeName: Map<string, string>,
  ): Map<string, CircuitBreaker> {
    // key is node id, value is node's ports
    const nodeId2OutputPorts = new Map<string, VsPort[]>();
    ports
      .filter((p) => p.type === VsPortTypeEnum.OUTPUT_PORT)
      .forEach((port) => {
        const existing = nodeId2OutputPorts.get(port.nodeId) || [];
        existing.push(port);
        nodeId2OutputPorts.set(port.nodeId, existing);
      });

    const nodeId2CircuitBreaker = new Map<string, CircuitBreaker>();

    for (const [nodeId, node] of nodeId2node.entries()) {
      if (node.taskType === VsNodeTaskTypeEnum.HTTP) {
        // generate circuit breaker
        // 获取对应的port上配置的属性
        const outPorts = nodeId2OutputPorts.get(nodeId);
        if (!outPorts || outPorts.length === 0) {
          // skip if node is not full config
          continue;
        }
        if (outPorts.length !== 1) {
          this.logger.error(
            `http node ${nodeId}, outputPorts = ${JSON.stringify(ports)}, is not correct, data may be corrupted!`,
          );
          throw new VsAdapterException(
            `工程[${projectName}]节点[${nodeId2NodeName.get(nodeId) || ''}]端口数量非法,请检查数据`,
          );
        }
        const properties = outPorts[0].properties;
        if (!properties || properties.trim().length === 0) {
          continue;
        }
        const vsPortProp = this.jacksonUtil.parseObject(properties, VsPortProp);
        const httpProp = vsPortProp.http;
        if (!httpProp) {
          continue;
        }
        const circuitBreakerConfig =
          this.circuitBreakUtil.getCircuitBreakerConfig(
            httpProp.slidingWindowSize,
            httpProp.minimumNumberOfCalls,
            httpProp.failureRateThreshold,
            httpProp.keepOpenStateInSeconds * 1000, // 转换为毫秒
            httpProp.permittedNumberOfCallsInHalfOpenState,
          );
        const circuitBreaker =
          this.circuitBreakerRegistry.circuitBreaker(nodeId);
        nodeId2CircuitBreaker.set(nodeId, circuitBreaker);
      }
    }

    return nodeId2CircuitBreaker;
  }

  private getGeneralDataConvMappingMap(
    nodeId2node: Map<string, VsNode>,
    ports: VsPort[],
    projectName: string,
    nodeId2NodeName: Map<string, string>,
  ): Map<string, VsDataConvRT> {
    // key is node id, value is node's ports
    const nodeId2OutputPorts = new Map<string, VsPort[]>();
    ports
      .filter((p) => p.type === VsPortTypeEnum.OUTPUT_PORT)
      .forEach((port) => {
        const existing = nodeId2OutputPorts.get(port.nodeId) || [];
        existing.push(port);
        nodeId2OutputPorts.set(port.nodeId, existing);
      });

    const nodeId2DataConvRT = new Map<string, VsDataConvRT>();

    for (const [nodeId, node] of nodeId2node.entries()) {
      // if (node.taskType === VsNodeTaskTypeEnum.DATA_MAPPING) {
      //   // generate data convert mapping config
      //   // 获取对应的port上配置的属性
      //   const outPorts = nodeId2OutputPorts.get(nodeId);
      //   if (!outPorts || outPorts.length === 0) {
      //     // skip if node is not full config
      //     continue;
      //   }
      //   if (outPorts.length !== 1) {
      //     this.logger.error(
      //       `convert node ${nodeId}, outputPorts = ${JSON.stringify(ports)}, is not correct, data may be corrupted!`,
      //     );
      //     throw new VsAdapterException(
      //       `工程[${projectName}]节点[${nodeId2NodeName.get(nodeId) || ''}]端口数量非法,请检查数据`,
      //     );
      //   }
      //   // skip empty prop
      //   const properties = outPorts[0].properties;
      //   if (!properties || properties.trim().length === 0) {
      //     continue;
      //   }
      //   const vsPortProp = this.jacksonUtil.parseObject(properties, VsPortProp);
      //   const dataMappingProp = vsPortProp.dataMapping;
      //   if (!dataMappingProp) {
      //     continue;
      //   }
      //   const vsDataConvProp = dataMappingProp.vsDataConvProp;
      //   // skip null config
      //   if (!vsDataConvProp) {
      //     continue;
      //   }
      //   const vsDataConvRT =
      //     this.vsDataConvertUtil.checkAndGetVsDataConvRT(vsDataConvProp);
      //   nodeId2DataConvRT.set(nodeId, vsDataConvRT);
      // }
    }

    return nodeId2DataConvRT;
  }
}

// 导出所有需要的类型和服务
export { VsProjectService as default };
