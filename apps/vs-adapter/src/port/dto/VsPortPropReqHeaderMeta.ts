import {
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
  IsOptional,
} from 'class-validator';

// 假设这个枚举已经定义
export enum VsPortReqHeaderMetaOpTypeEnum {}
// 根据实际情况定义枚举值

/**
 * used for FULL add/update/query
 * 请求头组件
 */
export class VsPortPropReqHeaderMeta {
  // @ApiProperty({ description: '键' })
  @IsNotEmpty({ message: '键不能为空' })
  @IsString()
  @Length(1, 64, { message: '键长度为1到64' })
  key: string;

  // @ApiProperty({ description: '操作类型', enum: VsPortReqHeaderMetaOpTypeEnum })
  @IsNotEmpty({ message: '操作类型不能为空' })
  @IsEnum(VsPortReqHeaderMetaOpTypeEnum)
  op: VsPortReqHeaderMetaOpTypeEnum;

  // @ApiPropertyOptional({ description: '值' })
  @IsOptional()
  @IsString()
  value?: string;
}
