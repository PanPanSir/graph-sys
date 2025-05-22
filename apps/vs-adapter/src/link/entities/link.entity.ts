import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Link {
  @ApiProperty({ description: '链接ID' })
  @IsNotEmpty({ message: '链接ID不能为空' })
  @MaxLength(64, { message: '链接ID最大长度为64' })
  id: string;

  @ApiProperty({ description: '项目ID' })
  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: number;

  @ApiProperty({ description: '起始节点ID' })
  @IsNotEmpty({ message: '起始节点ID不能为空' })
  @MaxLength(64, { message: '起始节点ID最大长度为64' })
  startNodeId: string;

  @ApiProperty({ description: '结束节点ID' })
  @IsNotEmpty({ message: '结束节点ID不能为空' })
  @MaxLength(64, { message: '结束节点ID最大长度为64' })
  endNodeId: string;

  @ApiProperty({ description: '起始端口ID' })
  @IsNotEmpty({ message: '起始端口ID不能为空' })
  @MaxLength(64, { message: '起始端口ID最大长度为64' })
  startPortId: string;

  @ApiProperty({ description: '结束端口ID' })
  @IsNotEmpty({ message: '结束端口ID不能为空' })
  @MaxLength(64, { message: '结束端口ID最大长度为64' })
  endPortId: string;

  @ApiProperty({ description: '属性' })
  @IsNotEmpty({ message: '属性不能为空' })
  properties: any;

  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @ApiProperty({ description: '修改时间' })
  modifyTime: Date;

  static fromPrisma(prismaLink: any): Link {
    const link = new Link();
    link.id = prismaLink.id;
    link.projectId = prismaLink.project_id;
    link.startNodeId = prismaLink.start_node_id;
    link.endNodeId = prismaLink.end_node_id;
    link.startPortId = prismaLink.start_port_id;
    link.endPortId = prismaLink.end_port_id;
    link.properties = prismaLink.properties;
    link.createTime = prismaLink.create_time;
    link.modifyTime = prismaLink.modify_time;
    return link;
  }
}
