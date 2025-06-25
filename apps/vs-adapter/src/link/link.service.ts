import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UpdateLinkDto } from './dto/update-link.dto';
import { VsLinkAddReq } from './dto/vs-link-add-req.dto';
import { PrismaService } from '@app/prisma';
import { VsNode } from '../node/entities/node.entity';
import { VsPort } from '../port/entities/port.entity';
import { VsPortTypeEnum } from '@prisma/client';

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
    let nodeNode = null;
    for (const node of nodes) {
      if ((req.sourceId = node.id)) startNode = node;
      if (req.targetId === node.id) nodeNode = node;
    }
    if (!startNode || !nodeNode) {
      throw new BadRequestException('连线异常：边的两个节点必须都存在');
    }
    const sourcePort = await this.prismaService.t_vs_port.findUnique({
      where: {
        id: req.sourcePort,
      },
    });
    const targetPort = await this.prismaService.t_vs_port.findUnique({
      where: {
        id: req.targetPort,
      },
    });
    this.validPort(startNode, nodeNode, sourcePort, targetPort);
    await this.prismaService.t_vs_link.update({
      where: {
        id: req.id,
      },
      data: {
        sourceId: req.sourceId,
        sourcePort: req.sourcePort,
        targetId: req.targetId,
        targetPort: req.targetPort,
      },
    });
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
  findAll() {
    return `This action returns all link`;
  }

  findOne(id: number) {
    return `This action returns a #${id} link`;
  }

  update(id: number, updateLinkDto: UpdateLinkDto) {
    return `This action updates a #${id} link`;
  }

  remove(id: number) {
    return `This action removes a #${id} link`;
  }
}
