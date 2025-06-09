import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { VsLinkProp } from './link.prop.entity';

export class VsLink {
  @IsNotEmpty({ message: '链接ID不能为空' })
  @MaxLength(64, { message: '链接ID最大长度为64' })
  id: string;

  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId?: number;

  @IsNotEmpty({ message: '起始节点ID不能为空' })
  @MaxLength(64, { message: '起始节点ID最大长度为64' })
  sourceId: string;

  @IsNotEmpty({ message: '结束节点ID不能为空' })
  @MaxLength(64, { message: '结束节点ID最大长度为64' })
  targetId: string;

  @IsNotEmpty({ message: '起始端口ID不能为空' })
  @MaxLength(64, { message: '起始端口ID最大长度为64' })
  sourcePort: string;

  @IsNotEmpty({ message: '结束端口ID不能为空' })
  @MaxLength(64, { message: '结束端口ID最大长度为64' })
  targetPort: string;

  @IsNotEmpty({ message: '属性不能为空' })
  properties?: VsLinkProp;

  createTime?: Date;

  modifyTime?: Date;

  static fromPrisma(prismaLink: VsLink): VsLink {
    const link = new VsLink();
    link.id = prismaLink.id;
    link.projectId = prismaLink.projectId;
    link.sourceId = prismaLink.sourceId;
    link.targetId = prismaLink.targetId;
    link.sourcePort = prismaLink.sourcePort;
    link.targetPort = prismaLink.targetPort;
    link.properties = prismaLink.properties;
    link.createTime = prismaLink.createTime;
    link.modifyTime = prismaLink.modifyTime;
    return link;
  }
}
