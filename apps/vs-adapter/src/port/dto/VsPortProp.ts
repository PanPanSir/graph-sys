import {
  IsString,
  IsInt,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VsPortPropRoute } from './VsPortPropRoute';
import { VsPortPropHttp } from './VsPortPropHttp';
import { VsPortPropContext } from './VsPortPropContext';
import { VsPortPropDataMapping } from './VsPortPropDataMapping';

/**
 * used for FULL add/update/query
 * 端口属性
 */
export class VsPortProp {
  // ------------ 纯脚本组件(CONVERT/END...)的属性 ------------
  @IsOptional()
  @IsString()
  @Length(0, 20000, { message: '主方法内容长度不能超过20000个字符' })
  script?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20000, { message: '其他定义内容长度不能超过20000个字符' })
  additionDefine?: string;
  // ------------ 纯脚本组件的属性 ------------

  @IsNotEmpty({ message: '端口名不能为空' })
  @IsString()
  @Length(1, 64, { message: '端口名长度为1到64' })
  name: string;

  @IsInt()
  @IsNotEmpty({ message: '端口序不能为空' })
  order: number = -1;

  @IsOptional()
  @ValidateNested()
  @Type(() => VsPortPropRoute)
  route?: VsPortPropRoute;

  @IsOptional()
  @ValidateNested()
  @Type(() => VsPortPropHttp)
  http?: VsPortPropHttp;

  @IsOptional()
  @ValidateNested()
  @Type(() => VsPortPropContext)
  context?: VsPortPropContext;

  // @IsOptional()
  // @ValidateNested()
  // @Type(() => VsPortPropReqHeader)
  // reqHeader?: VsPortPropReqHeader;

  // @IsOptional()
  // @ValidateNested()
  // @Type(() => VsPortPropRspHeader)
  // rspHeader?: VsPortPropRspHeader;

  @IsOptional()
  @ValidateNested()
  @Type(() => VsPortPropDataMapping)
  dataMapping?: VsPortPropDataMapping;
}
