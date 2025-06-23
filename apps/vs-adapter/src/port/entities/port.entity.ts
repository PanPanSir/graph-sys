import {
  VsApiTypeEnum,
  VsHttpMethodEnum,
  VsPortTypeEnum,
} from '@app/enum//port.enum';
import { VsPortProp } from './port.prop.entity';
import { PathParam } from '../dto/VsPortPropHttp';

export class VsPort {
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
  properties: string;

  // @IsOptional()
  // @IsNumber()
  // contextCompApiId?: number;

  method?: VsHttpMethodEnum;

  path?: string;

  // @IsOptional()
  // @IsNumber()
  // httpCompApiId?: number;

  url?: string;

  // @IsOptional()
  requestTimeout?: number; // 单位：毫秒
  pathParams?: PathParam[];

  // @IsOptional()
  // @MaxLength(12, { message: '源API类型最大长度为12' })
  sourceApiType?: string;

  // @IsOptional()
  // @MaxLength(12, { message: '目标API类型最大长度为12' })
  targetApiType?: VsApiTypeEnum;

  // @IsOptional()
  // @IsNumber()
  sourceApiId?: number;

  // @IsOptional()
  // @IsNumber()
  targetApiId?: number;

  createTime: Date;

  modifyTime: Date;

  static fromPrisma(prismaPort: VsPort): VsPort {
    const port = new VsPort();
    port.id = prismaPort.id;
    port.projectId = prismaPort.projectId;
    port.nodeId = prismaPort.nodeId;
    port.type = prismaPort.type as VsPortTypeEnum;
    port.properties = JSON.parse(prismaPort.properties);
    // port.contextCompApiId = prismaPort.contextCompApiId;
    port.method = prismaPort.method;
    port.path = prismaPort.path;
    // port.httpCompApiId = prismaPort.httpCompApiId;
    port.url = prismaPort.url;
    port.requestTimeout = prismaPort.requestTimeout;
    port.pathParams = prismaPort.pathParams;
    port.sourceApiType = prismaPort.sourceApiType;
    port.targetApiType = prismaPort.targetApiType;
    port.sourceApiId = prismaPort.sourceApiId;
    port.targetApiId = prismaPort.targetApiId;
    port.createTime = prismaPort.createTime;
    port.modifyTime = prismaPort.modifyTime;
    return port;
  }
}
