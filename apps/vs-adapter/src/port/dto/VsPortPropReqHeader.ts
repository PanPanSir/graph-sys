import { IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { VsPortPropReqHeaderMeta } from './VsPortPropReqHeaderMeta';

/**
 * used for FULL add/update/query
 * 请求头组件
 */
export class VsPortPropReqHeader {
  // @ApiPropertyOptional({
  //   description: 'meta属性',
  //   type: [VsPortPropReqHeaderMeta],
  // })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VsPortPropReqHeaderMeta)
  meta?: VsPortPropReqHeaderMeta[];
}
