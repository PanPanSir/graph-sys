import { VsApiTypeEnum, VsHttpMethodEnum } from '@app/enum/port.enum';
import { VsPortTypeEnum } from '@prisma/client';
import { VsPortProp } from '../dto/VsPortProp';
import { JsonValue } from '@prisma/client/runtime/library';

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
  properties: VsPortProp;

  // @IsOptional()
  // @IsNumber()
  // contextCompApiId?: number;

  method?: VsHttpMethodEnum;

  path?: string;

  // @IsOptional()
  // @IsNumber()
  // httpCompApiId?: number;

  // @IsOptional()
  requestTimeout?: number; // 单位：毫秒

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

  /**
   * 将 Prisma 查询结果安全转换为 VsPort 类型
   * @param prismaPort Prisma 查询返回的端口对象
   * @returns 转换后的 VsPort 对象
   */
  static prismaToVsPort(prismaPort: any): VsPort {
    if (!prismaPort) {
      throw new Error('端口对象不能为空');
    }

    const vsPort = new VsPort();

    // 复制基本属性
    vsPort.id = prismaPort.id;
    vsPort.projectId = prismaPort.projectId;
    vsPort.nodeId = prismaPort.nodeId;
    vsPort.type = prismaPort.type;
    vsPort.method = prismaPort.method;
    vsPort.path = prismaPort.path;
    vsPort.requestTimeout = prismaPort.requestTimeout;
    vsPort.createTime = prismaPort.createTime;
    vsPort.modifyTime = prismaPort.modifyTime;
    vsPort.targetApiId = prismaPort.targetApiId;

    // 安全转换 properties
    vsPort.properties = this.jsonValueToVsPortProp(prismaPort.properties);
    return vsPort;
  }
  /**
   * 将 JsonValue 转换为 VsPortProp
   * @param jsonValue Prisma 的 JsonValue 类型
   * @returns VsPortProp 对象
   */
  static jsonValueToVsPortProp(jsonValue: JsonValue): VsPortProp {
    if (!jsonValue || typeof jsonValue !== 'object') {
      return new VsPortProp();
    }

    const properties = jsonValue as any;
    const vsPortProp = new VsPortProp();

    // 安全赋值，提供默认值
    vsPortProp.name = properties.name || '';
    vsPortProp.order = properties.order || -1;
    vsPortProp.script = properties.script || '';
    vsPortProp.additionDefine = properties.additionDefine || '';

    // 复制嵌套对象
    if (properties.http) {
      vsPortProp.http = properties.http;
    }
    if (properties.context) {
      vsPortProp.context = properties.context;
    }
    if (properties.route) {
      vsPortProp.route = properties.route;
    }
    if (properties.dataMapping) {
      vsPortProp.dataMapping = properties.dataMapping;
    }

    return vsPortProp;
  }
}
