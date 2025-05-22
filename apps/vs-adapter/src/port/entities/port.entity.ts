import { VsPortType } from '../../common/enums/port.enum';
import { IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Port {
  @ApiProperty({ description: '端口ID' })
  @IsNotEmpty({ message: '端口ID不能为空' })
  @MaxLength(64, { message: '端口ID最大长度为64' })
  id: string;

  @ApiProperty({ description: '项目ID' })
  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: number;

  @ApiProperty({ description: '节点ID' })
  @IsNotEmpty({ message: '节点ID不能为空' })
  @MaxLength(64, { message: '节点ID最大长度为64' })
  nodeId: string;

  @ApiProperty({ description: '端口类型', enum: VsPortType })
  @IsNotEmpty({ message: '端口类型不能为空' })
  @MaxLength(16, { message: '端口类型最大长度为16' })
  type: VsPortType;

  @ApiProperty({ description: '属性' })
  @IsNotEmpty({ message: '属性不能为空' })
  properties: any;

  @ApiProperty({ description: '上下文组件API ID', required: false })
  @IsOptional()
  @IsNumber()
  contextCompApiId?: number;

  @ApiProperty({ description: 'HTTP组件API ID', required: false })
  @IsOptional()
  @IsNumber()
  httpCompApiId?: number;

  @ApiProperty({ description: '源API类型', required: false })
  @IsOptional()
  @MaxLength(12, { message: '源API类型最大长度为12' })
  sourceApiType?: string;

  @ApiProperty({ description: '目标API类型', required: false })
  @IsOptional()
  @MaxLength(12, { message: '目标API类型最大长度为12' })
  targetApiType?: string;

  @ApiProperty({ description: '源API ID', required: false })
  @IsOptional()
  @IsNumber()
  sourceApiId?: number;

  @ApiProperty({ description: '目标API ID', required: false })
  @IsOptional()
  @IsNumber()
  targetApiId?: number;

  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @ApiProperty({ description: '修改时间' })
  modifyTime: Date;

  static fromPrisma(prismaPort: any): Port {
    const port = new Port();
    port.id = prismaPort.id;
    port.projectId = prismaPort.project_id;
    port.nodeId = prismaPort.node_id;
    port.type = prismaPort.type as VsPortType;
    port.properties = prismaPort.properties;
    port.contextCompApiId = prismaPort.context_comp_api_id;
    port.httpCompApiId = prismaPort.http_comp_api_id;
    port.sourceApiType = prismaPort.source_api_type;
    port.targetApiType = prismaPort.target_api_type;
    port.sourceApiId = prismaPort.source_api_id;
    port.targetApiId = prismaPort.target_api_id;
    port.createTime = prismaPort.create_time;
    port.modifyTime = prismaPort.modify_time;
    return port;
  }
}
