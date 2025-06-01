import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { VsLinkProp } from './link.prop.entity';

export class Link {
  @IsNotEmpty({ message: '链接ID不能为空' })
  @MaxLength(64, { message: '链接ID最大长度为64' })
  id: string;

  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: number;

  @IsNotEmpty({ message: '起始节点ID不能为空' })
  @MaxLength(64, { message: '起始节点ID最大长度为64' })
  startNodeId: string;

  @IsNotEmpty({ message: '结束节点ID不能为空' })
  @MaxLength(64, { message: '结束节点ID最大长度为64' })
  endNodeId: string;

  @IsNotEmpty({ message: '起始端口ID不能为空' })
  @MaxLength(64, { message: '起始端口ID最大长度为64' })
  startPortId: string;

  @IsNotEmpty({ message: '结束端口ID不能为空' })
  @MaxLength(64, { message: '结束端口ID最大长度为64' })
  endPortId: string;

  @IsNotEmpty({ message: '属性不能为空' })
  properties: VsLinkProp;

  createTime: Date;

  modifyTime: Date;

  static fromPrisma(prismaLink: Link): Link {
    const link = new Link();
    link.id = prismaLink.id;
    link.projectId = prismaLink.projectId;
    link.startNodeId = prismaLink.startNodeId;
    link.endNodeId = prismaLink.endNodeId;
    link.startPortId = prismaLink.startPortId;
    link.endPortId = prismaLink.endPortId;
    link.properties = prismaLink.properties;
    link.createTime = prismaLink.createTime;
    link.modifyTime = prismaLink.modifyTime;
    return link;
  }
}
