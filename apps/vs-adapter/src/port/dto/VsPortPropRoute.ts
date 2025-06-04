import { IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { VsPortPropRouteMeta } from './VsPortPropRouteMeta';

/**
 * used for FULL add/update/query
 * 路由组件
 */
export class VsPortPropRoute {
  // @ApiPropertyOptional({ description: 'meta属性', type: [VsPortPropRouteMeta] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VsPortPropRouteMeta)
  meta?: VsPortPropRouteMeta[];
}
