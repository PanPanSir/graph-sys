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
      node.taskType,
      req.type,
    );
    return 'success';
  }
  checkCompositeNormalNodeOutputPortNameLength(
    portName: string,
    taskType: VsNodeTaskTypeEnum,
    portType: VsPortTypeEnum,
  ) {}
}
