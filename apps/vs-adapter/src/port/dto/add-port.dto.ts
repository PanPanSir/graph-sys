import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { VsHttpMethodEnum, VsPortTypeEnum } from '@app/enum//port.enum';
import { VsPortProp } from './VsPortProp';
import { VsPort } from '../entities/port.entity';
import { PathParam } from './VsPortPropHttp';

export class AddPortDto {
  @IsNotEmpty({
    message: 'port id不能为空',
  })
  @IsString()
  id: string;
  projectId: string;

  @IsString()
  nodeId: string;

  @IsOptional()
  properties?: VsPortProp;

  @IsEnum(VsPortTypeEnum)
  type: VsPortTypeEnum;

  // @IsNumber()
  // @IsOptional()
  // contextCompApiId?: number;

  @IsOptional()
  @IsEnum(VsHttpMethodEnum)
  method?: VsHttpMethodEnum;

  @IsOptional()
  @IsString()
  path?: string;

  // @IsNumber()
  // @IsOptional()
  // httpCompApiId?: number;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  requestTimeout?: string;

  pathParams?: PathParam[];

  // @IsEnum(VsApiType)
  // @IsOptional()
  // sourceApiType?: VsApiType;

  // @IsEnum(VsApiType)
  // @IsOptional()
  // targetApiType?: VsApiType;

  // @IsNumber()
  // @IsOptional()
  // sourceApiId?: number;

  // @IsNumber()
  // @IsOptional()
  // targetApiId?: number;

  // 深拷贝方法
  clone(): AddPortDto {
    return Object.assign(new AddPortDto(), this);
  }

  toString(): string {
    const parts = [`VsPort{id=${this.id}`];

    if (this.projectId) parts.push(`projectId=${this.projectId}`);
    if (this.nodeId) parts.push(`nodeId=${this.nodeId}`);
    if (this.type) parts.push(`type=${this.type}`);
    if (this.method && this.path)
      parts.push(`method=${this.method}, path=${this.path}`);
    if (this.method && this.url)
      parts.push(`url=${this.url}, method=${this.method}`);
    // if (this.sourceApiType) parts.push(`sourceApiType=${this.sourceApiType}`);
    // if (this.targetApiType) parts.push(`targetApiType=${this.targetApiType}`);
    // if (this.sourceApiId && this.sourceApiId >= 0)
    //   parts.push(`sourceApiId=${this.sourceApiId}`);
    // if (this.targetApiId) parts.push(`targetApiId=${this.targetApiId}`);

    return parts.join(', ') + '}';
  }
  // 转换为 VsPort 实体，其中vsPort实体是要存储到数据库中的，而AddPortDto是前端传过来的，两者的属性可能不一致，需要转换一下
  // Vsport放到这里的好处是可以在转换的时候校验一下属性是否正确，避免存储到数据库的时候出错
  toVsPort() {
    const vsPort = new VsPort();
    vsPort.id = this.id; // generate by front end
    vsPort.projectId = this.projectId;
    vsPort.nodeId = this.nodeId;
    vsPort.type = this.type;

    if (this.properties?.context != null) {
      // const apiId = this.properties.context.contextCompApiId;
      // vsPort.contextCompApiId = apiId;
      vsPort.method = this.properties.context.method;
      vsPort.path = this.properties.context.path;
    }

    if (this.properties?.http != null) {
      // const apiId = this.properties.http.httpCompApiId;
      // vsPort.httpCompApiId = apiId;
      const { url, method, pathParams, requestTimeout } = this.properties.http;
      vsPort.url = url;
      vsPort.method = method;
      // 兼容数据库，数据库层面 ： `schema.prisma` 中定义为pathParams为 Json? 类型
      vsPort.pathParams = pathParams as any;
      vsPort.requestTimeout = requestTimeout;
    }

    if (this.properties?.dataMapping != null) {
      vsPort.sourceApiType = this.properties.dataMapping.sourceApiType;
      vsPort.sourceApiId = this.properties.dataMapping.sourceApiId;
      vsPort.targetApiType = this.properties.dataMapping.targetApiType;
      vsPort.targetApiId = this.properties.dataMapping.targetApiId;
    }

    // 使用 JSON.stringify 将 properties 对象转换为 JSON 字符串
    vsPort.properties = JSON.stringify(this.properties);

    return vsPort;
  }
}
