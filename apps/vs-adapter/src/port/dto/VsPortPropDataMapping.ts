import { IsOptional, ValidateNested, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { VsDataConvProp } from './VsDataConvProp';

// 假设这些枚举已经定义
export enum VsApiTypeEnum {}
// 根据实际情况定义枚举值

export enum VsDataConvertTypeEnum {}
// 根据实际情况定义枚举值

/**
 * used for FULL add/update/query
 * 数据映射组件
 */
export class VsPortPropDataMapping {
  // description: '数据转换配置中源数据格式对应的接口类型',
  @IsOptional()
  @IsEnum(VsApiTypeEnum)
  sourceApiType?: VsApiTypeEnum;

  // description: '数据转换配置中目标数据格式对应的接口类型',
  @IsOptional()
  @IsEnum(VsApiTypeEnum)
  targetApiType?: VsApiTypeEnum;

  // description: '数据转换配置中源数据格式对应的源接口ID',
  @IsOptional()
  @IsInt()
  sourceApiId?: number;

  // description: '数据转换配置中目标数据格式对应的目标接口ID',
  @IsOptional()
  @IsInt()
  targetApiId?: number;

  // description: '转换组件中源类型',
  @IsOptional()
  @IsEnum(VsDataConvertTypeEnum)
  sourceConvertType?: VsDataConvertTypeEnum;

  // description: '转换组件中目标类型',
  @IsOptional()
  @IsEnum(VsDataConvertTypeEnum)
  targetConvertType?: VsDataConvertTypeEnum;

  // @ApiPropertyOptional({ description: '转换配置', type: () => VsDataConvProp })
  @IsOptional()
  @ValidateNested()
  @Type(() => VsDataConvProp)
  vsDataConvProp?: VsDataConvProp;
}
