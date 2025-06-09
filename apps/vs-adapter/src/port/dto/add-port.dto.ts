import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { VsPortTypeEnum } from '@app/enum//port.enum';
import { VsPortProp } from './VsPortProp';
import { Port } from '../entities/port.entity';

export class AddPortDto {
  @IsNotEmpty({
    message: 'port id不能为空',
  })
  @IsString()
  id: string;
  @IsNumber()
  projectId: number;

  @IsString()
  nodeId: string;

  @IsString()
  @IsOptional()
  properties?: VsPortProp;

  @IsEnum(VsPortTypeEnum)
  type: VsPortTypeEnum;

  @IsNumber()
  @IsOptional()
  contextCompApiId?: number;

  @IsNumber()
  @IsOptional()
  httpCompApiId?: number;

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
    if (this.contextCompApiId)
      parts.push(`contextCompApiId=${this.contextCompApiId}`);
    if (this.httpCompApiId) parts.push(`httpCompApiId=${this.httpCompApiId}`);
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
    const vsPort = new Port();
    vsPort.id = this.id; // generate by front end
    vsPort.projectId = this.projectId;
    vsPort.nodeId = this.nodeId;
    vsPort.type = this.type;

    if (this.properties?.context != null) {
      const apiId = this.properties.context.contextCompApiId;
      vsPort.contextCompApiId = apiId;
    }

    if (this.properties?.http != null) {
      const apiId = this.properties.http.httpCompApiId;
      vsPort.httpCompApiId = apiId;
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
