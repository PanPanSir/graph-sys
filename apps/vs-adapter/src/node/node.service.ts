import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AddNodeDto } from './dto/add-node.dto';
import { PrismaService } from '@app/prisma';
import { VsNodeTaskType, VsNodeViewType } from '../common/enums/node.enum';
import { VsPortType } from '../common/enums/port.enum';

@Injectable()
export class NodeService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async add(addNodeDto: AddNodeDto) {
    const contextNodes = await this.prismaService.t_vs_node.findMany({
      where: {
        project_id: addNodeDto.projectId,
        task_type: VsNodeTaskType.CONTEXT,
      },
    });
    if (contextNodes.length > 1) {
      throw new UnauthorizedException(
        '开始节点只能有1个,请删除多余的开始节点后再操作',
      );
    }
    if (
      addNodeDto.taskType === VsNodeTaskType.CONTEXT &&
      contextNodes.length === 1
    ) {
      throw new UnauthorizedException(
        '开始节点只能有1个,无法添加新的开始节点,若想继续添加当前节点,请删除已有的开始节点后再操作',
      );
    }
    if (addNodeDto.viewType === VsNodeViewType.COMPOSITE) {
      if (
        addNodeDto.taskType !== VsNodeTaskType.COMPOSITE_END &&
        addNodeDto.taskType !== VsNodeTaskType.COMPOSITE_NORMAL
      ) {
        throw new UnauthorizedException(
          `复合节点和任务类型,节点ID=${addNodeDto.id},节点类型=${addNodeDto.viewType},节点任务类型=${addNodeDto.taskType}"`,
        );
      }
    }
    await this.prismaService.t_vs_node.create({
      data: {
        id: addNodeDto.id,
        project_id: addNodeDto.projectId,
        task_type: addNodeDto.taskType,
        script: '',
        properties: JSON.stringify(addNodeDto.properties),
        view_type: addNodeDto.viewType,
        up_level_node_id: addNodeDto.upLevelNodeId, // 上一级节点id，如果是第一图层，其父节点id为-1好像
        class_bytes: Buffer.from([]),
      },
    });

    const ports = addNodeDto.ports;

    const portsToSave = [];
    if (ports && ports.length > 0) {
      for (const port of ports) {
        if (
          port.type === VsPortType.INPUT_PORT &&
          addNodeDto.taskType === VsNodeTaskType.CONTEXT
        ) {
          throw new UnauthorizedException(
            `开始节点不能添加输入端口,节点ID=${addNodeDto.id}`,
          );
        }
        if (
          port.type === VsPortType.OUTPUT_PORT &&
          addNodeDto.taskType === VsNodeTaskType.COMPOSITE_END
        ) {
          throw new UnauthorizedException(
            `结束节点不能添加输出端口,节点ID=${addNodeDto.id}`,
          );
        }

        portsToSave.push({
          id: port.id,
          node_id: addNodeDto.id,
          project_id: addNodeDto.projectId,
          type: port.type,
          properties: JSON.stringify(port.properties),
          context_comp_api_id: port.contextCompApiId,
          http_comp_api_id: port.httpCompApiId,
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
        project_id: projectId,
      },
    });
    const nodesMap = nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
    const ports = await this.prismaService.t_vs_port.findMany({
      where: {
        project_id: projectId,
      },
    });
    const portsMap = ports.reduce((acc, port) => {
      if (!acc[port.node_id]?.ports) {
        acc[port.node_id].ports = [port];
      } else {
        acc[port.node_id].ports.push(port);
      }
      return acc;
    }, {});
    const links = await this.prismaService.t_vs_link.findMany({
      where: {
        project_id: projectId,
      },
    });
    const linksMap = links.reduce((acc, link) => {
      const linkStartNode = nodesMap[link.start_node_id];
      if (acc[linkStartNode.up_level_node_id]?.links) {
        acc[linkStartNode.up_level_node_id].links.push(link);
      } else {
        acc[linkStartNode.up_level_node_id] = {
          links: [link],
        };
      }
      return acc;
    }, {});
    // 找到一层所有的原子节点
    const upLayerAtomicNodes = nodes.filter((node) => {
      return (
        node.view_type === VsNodeViewType.ATOMIC &&
        node.up_level_node_id === '-1'
      );
    });
    // 找到一层所有的复合节点
    const upLayerCompositeNodes = nodes.filter((node) => {
      return (
        node.view_type === VsNodeViewType.COMPOSITE &&
        node.up_level_node_id === '-1'
      );
    });
    const endpointDefinitions = this.getEndpointDefinitions(
      upLayerAtomicNodes,
      portsMap,
    );
  }
  getEndpointDefinitions(upLayerAtomicNodes, portsMap) {
    const endpointDefinitions = [];
    for (const node of upLayerAtomicNodes) {
      const endpointDefinition = {
        id: node.id,
        taskType: node.task_type,
        viewType: node.view_type,
        upLevelNodeId: node.up_level_node_id,
        properties: JSON.parse(node.properties),
        ports: [],
      };
      // 转换并排序端口
      const curPorts = portsMap[node.id]?.ports
        .map((port) => new Port(port))
        .sort((a, b) => a.properties.order - b.properties.order);
      endpointDefinition.ports = curPorts;
    }
  }
}
