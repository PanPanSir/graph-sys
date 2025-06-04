import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsInt,
} from 'class-validator';
import { VsHttpMethodEnum } from './VsPortPropHttp';

/**
 * used for FULL add/update/query
 * Context组件
 */
export class VsPortPropContext {
  @IsNotEmpty({ message: '接口ID不能为空' })
  @IsInt()
  contextCompApiId: number;

  @IsOptional()
  @IsEnum(VsHttpMethodEnum)
  method?: VsHttpMethodEnum;

  @IsOptional()
  @IsString()
  path?: string;
}
