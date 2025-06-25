import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AddNodeDto } from './dto/add-node.dto';
import { PrismaService } from '@app/prisma';
import {
  VsNodeTaskTypeEnum,
  VsNodeViewTypeEnum,
  VsVirtualNodeTypeEnum,
} from '@app/enum//node.enum';
import { VsPortTypeEnum } from '@prisma/client';
import { VsPort } from '../port/entities/port.entity';
import {
  RouteDefinitionRespDto,
  VsNodeRespDto,
} from '../project/dto/project-layerLoad-req.dto';
import { VsNodeProp } from './entities/node.prop.entity';
import { UpdateNodeDto } from './dto/update-node.dto';
import { VsLink } from '../link/entities/link.entity';
import { VsNode } from './entities/node.entity';

@Injectable()
export class NodeService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async add(addNodeDto: AddNodeDto) {
    const contextNodes = await this.prismaService.t_vs_node.findMany({
      where: {
        projectId: addNodeDto.projectId,
        taskType: VsNodeTaskTypeEnum.CONTEXT,
      },
    });
    if (contextNodes.length > 1) {
      throw new UnauthorizedException(
        '开始节点只能有1个,请删除多余的开始节点后再操作',
      );
    }
    if (
      addNodeDto.taskType === VsNodeTaskTypeEnum.CONTEXT &&
      contextNodes.length === 1
    ) {
      throw new UnauthorizedException(
        '开始节点只能有1个,无法添加新的开始节点,若想继续添加当前节点,请删除已有的开始节点后再操作',
      );
    }
    if (addNodeDto.viewType === VsNodeViewTypeEnum.COMPOSITE) {
      if (
        addNodeDto.taskType !== VsNodeTaskTypeEnum.COMPOSITE_END &&
        addNodeDto.taskType !== VsNodeTaskTypeEnum.COMPOSITE_NORMAL
      ) {
        throw new UnauthorizedException(
          `复合节点和任务类型,节点ID=${addNodeDto.id},节点类型=${addNodeDto.viewType},节点任务类型=${addNodeDto.taskType}"`,
        );
      }
    }
    await this.prismaService.t_vs_node.create({
      data: {
        id: addNodeDto.id,
        projectId: addNodeDto.projectId,
        taskType: addNodeDto.taskType,
        script: '',
        properties: JSON.stringify(addNodeDto.properties),
        viewType: addNodeDto.viewType,
        upLevelNodeId: addNodeDto.upLevelNodeId, // 上一级节点id，如果是第一图层，其父节点id为-1好像
        classBytes: Buffer.from([]),
      },
    });

    const ports = addNodeDto.ports;

    const portsToSave = [];
    if (ports && ports.length > 0) {
      for (const port of ports) {
        if (
          port.type === VsPortTypeEnum.INPUT_PORT &&
          addNodeDto.taskType === VsNodeTaskTypeEnum.CONTEXT
        ) {
          throw new UnauthorizedException(
            `开始节点不能添加输入端口,节点ID=${addNodeDto.id}`,
          );
        }
        if (
          port.type === VsPortTypeEnum.OUTPUT_PORT &&
          addNodeDto.taskType === VsNodeTaskTypeEnum.COMPOSITE_END
        ) {
          throw new UnauthorizedException(
            `结束节点不能添加输出端口,节点ID=${addNodeDto.id}`,
          );
        }

        portsToSave.push({
          id: port.id,
          nodeId: addNodeDto.id,
          projectId: addNodeDto.projectId,
          type: port.type,
          properties: JSON.stringify(port.properties),
          // contextCompApiId: port.contextCompApiId,
          // httpCompApiId: port.httpCompApiId,
          // source_api_type: port.sourceApiType,
          // target_api_type: port.targetApiType,
          // source_api_id: port.sourceApiId,
          // target_api_id: port.targetApiId,
        });
      }
    }
    if (portsToSave.length > 0) {
      await this.prismaService.t_vs_port.createMany({
        data: portsToSave,
      });
    }
  }

  async list(projectId: number) {
    const project = await this.prismaService.t_vs_project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      throw new NotFoundException('项目不存在');
    }
    const nodes = await this.prismaService.t_vs_node.findMany({
      where: {
        projectId: projectId,
      },
    });
    const nodesMap = nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
    const ports = await this.prismaService.t_vs_port.findMany({
      where: {
        projectId: projectId,
      },
    });
    const portsMap = ports.reduce((acc, port) => {
      if (!acc[port.nodeId]?.ports) {
        if (!acc[port.nodeId]) {
          acc[port.nodeId] = {};
        }
        acc[port.nodeId].ports = [port];
      } else {
        acc[port.nodeId].ports.push(port);
      }
      return acc;
    }, {});
    const links: VsLink[] = await this.prismaService.t_vs_link.findMany({
      where: {
        projectId: projectId,
      },
    });
    const childNodesMap = nodes.reduce((acc, node) => {
      if (!acc[node.upLevelNodeId]) {
        acc[node.upLevelNodeId] = [];
      }
      acc[node.upLevelNodeId].push(node);
      return acc;
    }, {});
    // 找到一层所有的原子节点
    const upLayerAtomicNodes = nodes.filter((node) => {
      return (
        node.viewType === VsNodeViewTypeEnum.ATOMIC &&
        node.upLevelNodeId === '-1'
      );
    });
    // 找到一层所有的复合节点
    const upLayerCompositeNodes = nodes.filter((node) => {
      return (
        node.viewType === VsNodeViewTypeEnum.COMPOSITE &&
        node.upLevelNodeId === '-1'
      );
    });
    // 找到一层所有的非复合节点
    const endpointDefinitions = this.getEndpointDefinitions(
      upLayerAtomicNodes,
      portsMap,
    );
    let upLayerLinks = [];
    let routeDefinitions = [];
    try {
      // 一层边
      upLayerLinks = this.getUpLayerLinks(links, nodesMap);
      // 一层复合节点
      routeDefinitions = this.getRouteDefinitions(
        upLayerCompositeNodes,
        links,
        nodesMap,
        portsMap,
        childNodesMap,
      );
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException(e);
    }
    return {
      endpointDefinitions: endpointDefinitions || [],
      links: upLayerLinks,
      routeDefinitions,
    };
  }
  getUpLayerLinks(links: VsLink[], nodesMap: Record<string, VsNode>) {
    const upLayerLinks = [];
    for (const link of links) {
      const linkStartNode = nodesMap[link.sourceId];
      const linkEndNode = nodesMap[link.targetId];
      if (
        linkStartNode.upLevelNodeId === '-1' &&
        linkEndNode.upLevelNodeId === '-1'
      ) {
        upLayerLinks.push(link);
      }
    }
    return upLayerLinks;
  }
  getEndpointDefinitions(upLayerAtomicNodes, portsMap) {
    const endpointDefinitions = [];
    for (const node of upLayerAtomicNodes) {
      const endpointDefinition = {
        id: node.id,
        taskType: node.taskType,
        viewType: node.viewType,
        upLevelNodeId: node.upLevelNodeId,
        properties: JSON.parse(node.properties),
        ports: [],
      };
      // 前端添加端口的时候，是有顺序的，因此需要转换并排序端口
      const curPorts = portsMap[node.id]?.ports
        .map((port) => VsPort.fromPrisma(port))
        .sort((a, b) => a.properties.order - b.properties.order);
      endpointDefinition.ports = curPorts || [];
      endpointDefinitions.push(endpointDefinition);
    }
    return endpointDefinitions;
  }
  getRouteDefinitions(
    upLayerCompositeNodes,
    links,
    nodesMap,
    portsMap,
    childNodesMap,
  ) {
    const routeDefinitions = [];
    for (const node of upLayerCompositeNodes) {
      const routeDefinition: RouteDefinitionRespDto = node;
      // links: Link[];
      // ports: VsPort[];
      // nodes: VsNode[]
      // 隶属于当前复合节点的所有link，包括第一图层和第二图层的link
      const curLinks = this.getDownLayerLinks(links, nodesMap, node.id);
      routeDefinition.links = curLinks;
      routeDefinition.properties = JSON.parse(node.properties);
      // 获取当前节点在一层图中的端口
      const curPorts = portsMap[node.id]?.ports.sort(
        (a, b) => a.properties.order - b.properties.order,
      );
      // 二层的节点由虚拟节点和真实节点构成
      const downLayerNodes = this.getDownLayerNodes(
        portsMap,
        childNodesMap,
        node.id,
      );
      routeDefinition.nodes = downLayerNodes;
      routeDefinition.links = curLinks;
      routeDefinition.ports = curPorts;

      routeDefinitions.push(routeDefinition);
    }
    return routeDefinitions;
  }
  getDownLayerNodes(portsMap, childNodesMap, upLayerCompositeNodeId) {
    const nodes = [];
    const componentPorts = portsMap[upLayerCompositeNodeId]?.ports;

    // 构建第二图层的虚拟节点，包括输入和输出的虚拟节点
    for (const port of componentPorts) {
      const virtualNode = new VsNodeRespDto();
      virtualNode.id = port.id;
      virtualNode.upLevelNodeId = upLayerCompositeNodeId;
      const portProp = JSON.parse(port.properties);
      const nodeProp = new VsNodeProp();
      // 虚拟节点的信息，就是虚拟端口的信息复制过来的
      nodeProp.name = portProp.name;
      virtualNode.properties = nodeProp; // 是空的
      virtualNode.virtual = true;
      virtualNode.order = portProp.order;
      if (port.type === VsPortTypeEnum.INPUT_PORT) {
        virtualNode.virtualType = VsVirtualNodeTypeEnum.VIRTUAL_INPUT;
      } else if (port.type === VsPortTypeEnum.OUTPUT_PORT) {
        virtualNode.virtualType = VsVirtualNodeTypeEnum.VIRTUAL_OUTPUT;
      } else {
        throw new UnauthorizedException(
          `虚拟节点类型错误,节点ID=${upLayerCompositeNodeId},端口ID=${port.id}`,
        );
      }
      nodes.push(virtualNode);
    }
    nodes.sort((a, b) => a.order - b.order);

    // 添加第二图层的真实节点，并添加其ports
    const realNodes = childNodesMap[upLayerCompositeNodeId] || [];
    for (const node of realNodes) {
      const ports = portsMap[node.id]?.ports
        .sort((a, b) => a.properties.order - b.properties.order)
        .map((port) => ({
          ...port,
          properties: JSON.parse(port.properties),
        }));
      // 寻找其ports
      node.ports = ports;
      node.properties = JSON.parse(node.properties);
      nodes.push(node);
    }
    return nodes;
  }
  getDownLayerLinks(
    links: VsLink[],
    nodesMap: Record<string, VsNode>,
    upLayerCompositeNodeId: string,
  ) {
    const downLayerLinks = [];
    for (const link of links) {
      const linkStartNode = nodesMap[link.sourceId];
      const linkEndNode = nodesMap[link.targetId];
      // 前端需要自己构建第二图层的起点虚拟节点和结束节点的link
      // Link 的开始节点和结束节点都在第二图层
      if (
        linkStartNode.upLevelNodeId === upLayerCompositeNodeId ||
        linkEndNode.upLevelNodeId === upLayerCompositeNodeId
      ) {
        downLayerLinks.push(link);
        continue;
      }
      // Link 的开始节点在第一图层，结束节点在第二图层
      if (
        linkStartNode.id === upLayerCompositeNodeId &&
        linkEndNode.upLevelNodeId !== upLayerCompositeNodeId
      ) {
        downLayerLinks.push(link);
        continue;
      }
      // Link 的开始节点在第二图层，结束节点在第一图层
      if (
        linkEndNode.id === upLayerCompositeNodeId &&
        linkStartNode.upLevelNodeId !== upLayerCompositeNodeId
      ) {
        downLayerLinks.push(link);
        continue;
      }
    }
    return downLayerLinks;
  }
  async update(updateNodeDto: UpdateNodeDto) {
    const node = await this.prismaService.t_vs_node.update({
      where: {
        id: updateNodeDto.id,
      },
      data: {
        properties: JSON.stringify(updateNodeDto.properties),
      },
    });
    return node;
  }
}
