import { IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { VsPortPropRspHeaderMeta } from './VsPortPropRspHeaderMeta';

/**
 * used for FULL add/update/query
 * 响应头组件
 */
export class VsPortPropRspHeader {
  // @ApiPropertyOptional({
  //   description: 'meta属性',
  //   type: [VsPortPropRspHeaderMeta],
  // })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VsPortPropRspHeaderMeta)
  meta?: VsPortPropRspHeaderMeta[];
}
