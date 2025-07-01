import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { VsNodeProp } from './node.prop.entity';
import { VsNodeTaskTypeEnum, VsNodeViewTypeEnum } from '@app/enum/node.enum';

export class VsNode {
  @IsNotEmpty({ message: '节点ID不能为空' })
  @MaxLength(64, { message: '节点ID最大长度为64' })
  id: string;

  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: number;

  @IsNotEmpty({ message: '任务类型不能为空' })
  @MaxLength(16, { message: '任务类型最大长度为16' })
  taskType: VsNodeTaskTypeEnum;

  @IsNotEmpty({ message: '脚本不能为空' })
  script: string;

  @IsNotEmpty({ message: '类字节码不能为空' })
  classBytes: Buffer;

  @IsNotEmpty({ message: '属性不能为空' })
  properties: VsNodeProp;

  @IsNotEmpty({ message: '视图类型不能为空' })
  @MaxLength(16, { message: '视图类型最大长度为16' })
  viewType: VsNodeViewTypeEnum;

  @IsNotEmpty({ message: '上级节点ID不能为空' })
  @MaxLength(64, { message: '上级节点ID最大长度为64' })
  upLevelNodeId: string;

  createTime: Date;

  modifyTime: Date;

  static fromPrisma(prismaNode: VsNode): VsNode {
    const node = new VsNode();
    node.id = prismaNode.id;
    node.projectId = prismaNode.projectId;
    node.taskType = prismaNode.taskType as VsNodeTaskTypeEnum;
    node.script = prismaNode.script;
    node.classBytes = prismaNode.classBytes;
    node.properties = prismaNode.properties;
    node.viewType = prismaNode.viewType as VsNodeViewTypeEnum;
    node.upLevelNodeId = prismaNode.upLevelNodeId;
    node.createTime = prismaNode.createTime;
    node.modifyTime = prismaNode.modifyTime;
    return node;
  }
}
