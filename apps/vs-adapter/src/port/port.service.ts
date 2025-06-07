import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AddPortDto } from './dto/add-port.dto';
import { VsPortTypeEnum } from '../common/enums/port.enum';
import { PrismaService } from '@app/prisma';
import { VsNodeTaskTypeEnum } from '../common/enums/node.enum';

@Injectable()
export class PortService {
  create(createPortDto: AddPortDto) {
    return 'This action adds a new port' + createPortDto;
  }
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async add(req: AddPortDto) {
    // 检查nodeId下是否已经存在一个输入节点
    if (req.type === VsPortTypeEnum.INPUT_PORT) {
      const count = await this.prismaService.t_vs_port.count({
        where: {
          nodeId: req.nodeId,
          type: VsPortTypeEnum.INPUT_PORT,
        },
      });
      if (count > 0) {
        throw new BadRequestException(
          `节点ID=${req.nodeId}下存在输入端口,请检查`,
        );
      }
    }
    const node = await this.prismaService.t_vs_node.findUnique({
      where: {
        id: req.nodeId,
      },
      select: {
        id: true,
        taskType: true,
        viewType: true,
        projectId: true,
      },
    });
    this.checkCompositeNormalNodeOutputPortNameLength(
      req.properties.name,
      node.taskType as VsNodeTaskTypeEnum,
      req.type,
    );
     // start node only exist output port, no input port
    if (node.taskType === VsNodeTaskTypeEnum.CONTEXT) {
      if (req.type === VsPortTypeEnum.INPUT_PORT) {
        throw new BadRequestException(
          `起始节点只能存在输出端口,请检查`,
        );
      }
    }
     // end node only exist input port, no output port
    if (node.taskType === VsNodeTaskTypeEnum.END || node.viewType === VsNodeTaskTypeEnum.COMPOSITE_END) {
      if (req.type === VsPortTypeEnum.OUTPUT_PORT) {
        throw new BadRequestException(
          `结束节点只能存在输入端口,请检查`,
        );
      }
    }
    // check node output port limit
    // COMPOSITE_NORMAL & ROUTE can have more than one output ports
    if (
      node.taskType === VsNodeTaskTypeEnum.CONTEXT ||
      node.taskType === VsNodeTaskTypeEnum.HTTP ||
      node.taskType === VsNodeTaskTypeEnum.DATA_MAPPING
    ) {
      const count = await this.prismaService.t_vs_port.count({
        where: {
          nodeId: req.nodeId,
          type: VsPortTypeEnum.OUTPUT_PORT,
        },
      });
      if (count > 1) {
        throw new BadRequestException(
          `${node.taskType}节点ID=${req.nodeId}下存在多个输出端口,请检查`,
        );
      }
    }
    this.prismaService.t_vs_port.create({
      data: {
        ...req.toVsPort(),
        projectId: node.projectId,
      },
    });
    return 'success';
  }
  checkCompositeNormalNodeOutputPortNameLength(
    portName: string,
    taskType: VsNodeTaskTypeEnum,
    portType: VsPortTypeEnum,
  ) {
    if (
      taskType === VsNodeTaskTypeEnum.COMPOSITE_NORMAL && portType === VsPortTypeEnum.OUTPUT_PORT
    ) {
      if (portName.length > 10) {
        throw new BadRequestException(
          `复合节点输出端口名称不能超过10个字符`,
        );
      }
    }
  }
}
