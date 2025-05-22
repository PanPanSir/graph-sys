import { VsNodeTaskType, VsNodeViewType } from '../../common/enums/node.enum';
import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Node {
  @ApiProperty({ description: '节点ID' })
  @IsNotEmpty({ message: '节点ID不能为空' })
  @MaxLength(64, { message: '节点ID最大长度为64' })
  id: string;

  @ApiProperty({ description: '项目ID' })
  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: number;

  @ApiProperty({ description: '任务类型', enum: VsNodeTaskType })
  @IsNotEmpty({ message: '任务类型不能为空' })
  @MaxLength(16, { message: '任务类型最大长度为16' })
  taskType: VsNodeTaskType;

  @ApiProperty({ description: '脚本' })
  @IsNotEmpty({ message: '脚本不能为空' })
  script: string;

  @ApiProperty({ description: '类字节码' })
  @IsNotEmpty({ message: '类字节码不能为空' })
  classBytes: Buffer;

  @ApiProperty({ description: '属性' })
  @IsNotEmpty({ message: '属性不能为空' })
  properties: any;

  @ApiProperty({ description: '视图类型', enum: VsNodeViewType })
  @IsNotEmpty({ message: '视图类型不能为空' })
  @MaxLength(16, { message: '视图类型最大长度为16' })
  viewType: VsNodeViewType;

  @ApiProperty({ description: '上级节点ID' })
  @IsNotEmpty({ message: '上级节点ID不能为空' })
  @MaxLength(64, { message: '上级节点ID最大长度为64' })
  upLevelNodeId: string;

  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @ApiProperty({ description: '修改时间' })
  modifyTime: Date;

  static fromPrisma(prismaNode: any): Node {
    const node = new Node();
    node.id = prismaNode.id;
    node.projectId = prismaNode.project_id;
    node.taskType = prismaNode.task_type as VsNodeTaskType;
    node.script = prismaNode.script;
    node.classBytes = prismaNode.class_bytes;
    node.properties = prismaNode.properties;
    node.viewType = prismaNode.view_type as VsNodeViewType;
    node.upLevelNodeId = prismaNode.up_level_node_id;
    node.createTime = prismaNode.create_time;
    node.modifyTime = prismaNode.modify_time;
    return node;
  }
}
