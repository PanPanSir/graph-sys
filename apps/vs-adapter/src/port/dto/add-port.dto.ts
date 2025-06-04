import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { VsPortTypeEnum } from '../../common/enums/port.enum';

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
  properties?: string;

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
}
