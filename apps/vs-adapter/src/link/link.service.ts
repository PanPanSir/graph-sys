import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { VsLinkAddReq } from './dto/vs-link-add-req.dto';
import { PrismaService } from '@app/prisma';
import { VsNode } from '../node/entities/node.entity';
import { VsPort } from '../port/entities/port.entity';
import { VsPortTypeEnum } from '@prisma/client';
import { VsLinkDeleteReq } from './dto/vs-link-delete-dto';

@Injectable()
export class LinkService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  async add(req: VsLinkAddReq) {
    const links = await this.prismaService.t_vs_link.findMany({
      where: {
        sourceId: req.sourceId,
        sourcePort: req.sourcePort,
        targetId: req.targetId,
        targetPort: req.targetPort,
      },
    });
    if (links.length > 0) {
      throw new BadRequestException('连线异常：边不能重复');
    }
    const nodes = await this.prismaService.t_vs_node.findMany({
      where: {
        id: {
          in: [req.sourceId, req.targetId],
        },
      },
    });
    if (nodes.length < 2) {
      throw new BadRequestException('连线异常：边的两个节点必须都存在');
    }
    if (nodes.length > 2) {
      throw new BadRequestException(
        '当前边对应的节点超过2个,数据一致性存在问题,请检查',
      );
    }
    const ports = await this.prismaService.t_vs_port.findMany({
      where: {
        id: {
          in: [req.sourcePort, req.targetPort],
        },
      },
      select: {
        id: true,
        type: true,
      },
    });
    if (ports.length !== 2) {
      throw new BadRequestException('连线异常：边的两个端口必须都存在');
    }
    let startNode = null;
    let targetNode = null;
    for (const node of nodes) {
      if (req.sourceId === node.id) startNode = node;
      if (req.targetId === node.id) targetNode = node;
    }
    if (!startNode || !targetNode) {
      throw new BadRequestException('连线异常：边的两个节点必须都存在');
    }
    const sourcePortData = await this.prismaService.t_vs_port.findUnique({
      where: {
        id: req.sourcePort,
      },
    });
    const targetPortData = await this.prismaService.t_vs_port.findUnique({
      where: {
        id: req.targetPort,
      },
    });
    const sourcePort = VsPort.prismaToVsPort(sourcePortData);
    const targetPort = VsPort.prismaToVsPort(targetPortData);
    this.validPort(startNode, targetNode, sourcePort, targetPort);
    try {
      await this.prismaService.t_vs_link.create({
        data: {
          id: req.id,
          sourceId: req.sourceId,
          sourcePort: req.sourcePort,
          targetId: req.targetId,
          targetPort: req.targetPort,
          projectId: req.projectId,
          properties: req.properties,
        },
      });
    } catch (error) {
      if (error.meta?.target === 't_vs_link_start_node_id_key') {
        throw new BadRequestException('该源节点已经存在连接，请先删除现有连接');
      }
      throw new BadRequestException(error.message);
    }
    return;
  }
  validPort(
    startNode: VsNode,
    targetNode: VsNode,
    sourcePort: VsPort,
    targetPort: VsPort,
  ) {
    // 1: 边的节点均在同一图层(都在第一图层或都在第二图层)
    // 则端口类型只能为输出端口和输出端口,且开始端口必须为输出端口类型,结束端口必须为输入端口类型
    if (
      (startNode.upLevelNodeId === '-1' && targetNode.upLevelNodeId === '-1') ||
      (startNode.upLevelNodeId !== '-1' && targetNode.upLevelNodeId !== '-1')
    ) {
      if (
        !(
          sourcePort.type === VsPortTypeEnum.OUTPUT_PORT &&
          targetPort.type === VsPortTypeEnum.INPUT_PORT
        )
      ) {
        throw new BadRequestException(
          '连线异常：开始端口必须为输出端口，结束端口必须为开始端口',
        );
      }
      // 2: 边的开始节点在第一图层,结束节点在第二图层,则端口类型必须都为输入
    } else if (
      startNode.upLevelNodeId === '-1' &&
      targetNode.upLevelNodeId !== '-1'
    ) {
      if (
        !(
          sourcePort.type === VsPortTypeEnum.INPUT_PORT &&
          targetPort.type === VsPortTypeEnum.INPUT_PORT
        )
      ) {
        throw new BadRequestException(
          '连线异常：开始端口必须为输出端口，结束端口必须为输入端口',
        );
      }
      // 2: 边的开始节点在第二图层,结束节点在第一图层,则端口类型必须都为输出
    } else if (
      startNode.upLevelNodeId !== '-1' &&
      targetNode.upLevelNodeId === '-1'
    ) {
      if (
        !(
          sourcePort.type === VsPortTypeEnum.OUTPUT_PORT &&
          targetPort.type === VsPortTypeEnum.OUTPUT_PORT
        )
      ) {
        throw new BadRequestException(
          '连线异常：开始端口必须为输入端口，结束端口必须为输出端口',
        );
      }
    }
  }
  async delete(req: VsLinkDeleteReq) {
    try {
      const foundLink = await this.prismaService.t_vs_link.findUnique({
        where: {
          id: req.id,
        },
      });
      if (!foundLink) {
        throw new BadRequestException('待删除的连线不存在');
      }
      await this.prismaService.t_vs_link.delete({
        where: {
          id: req.id,
        },
      });
      return true;
    } catch (error) {
      // throw new BadRequestException('删除连线异常');
      console.error('删除连线异常', error);
    }
  }
}
