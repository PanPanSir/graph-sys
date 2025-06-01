import { VsPortTypeEnum } from '../../common/enums/port.enum';
import { VsPortProp } from './port.prop.entity';

export class Port {
  // @IsNotEmpty({ message: '端口ID不能为空' })
  // @MaxLength(64, { message: '端口ID最大长度为64' })
  id: string;

  // @IsNumber()
  // @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: number;

  // @IsNotEmpty({ message: '节点ID不能为空' })
  // @MaxLength(64, { message: '节点ID最大长度为64' })
  nodeId: string;

  // @IsNotEmpty({ message: '端口类型不能为空' })
  // @MaxLength(16, { message: '端口类型最大长度为16' })
  type: VsPortTypeEnum;

  // @IsNotEmpty({ message: '属性不能为空' })
  properties: VsPortProp;

  // @IsOptional()
  // @IsNumber()
  contextCompApiId?: number;

  // @IsOptional()
  // @IsNumber()
  httpCompApiId?: number;

  // @IsOptional()
  // @MaxLength(12, { message: '源API类型最大长度为12' })
  sourceApiType?: string;

  // @IsOptional()
  // @MaxLength(12, { message: '目标API类型最大长度为12' })
  targetApiType?: string;

  // @IsOptional()
  // @IsNumber()
  sourceApiId?: number;

  // @IsOptional()
  // @IsNumber()
  targetApiId?: number;

  createTime: Date;

  modifyTime: Date;

  static fromPrisma(prismaPort: Port): Port {
    const port = new Port();
    port.id = prismaPort.id;
    port.projectId = prismaPort.projectId;
    port.nodeId = prismaPort.nodeId;
    port.type = prismaPort.type as VsPortTypeEnum;
    port.properties = prismaPort.properties;
    port.contextCompApiId = prismaPort.contextCompApiId;
    port.httpCompApiId = prismaPort.httpCompApiId;
    port.sourceApiType = prismaPort.sourceApiType;
    port.targetApiType = prismaPort.targetApiType;
    port.sourceApiId = prismaPort.sourceApiId;
    port.targetApiId = prismaPort.targetApiId;
    port.createTime = prismaPort.createTime;
    port.modifyTime = prismaPort.modifyTime;
    return port;
  }
}
