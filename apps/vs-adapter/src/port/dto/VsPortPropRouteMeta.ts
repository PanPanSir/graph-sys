import { IsString, IsNotEmpty, Length, IsEnum } from 'class-validator';
import { VsPortRouteMetaDataTypeEnum, VsPortRouteMetaOpTypeEnum, VsPortRouteMetaSourceTypeEnum } from '@app/enum//port.route.enum';


// 根据实际情况定义枚举值

/**
 * used for FULL add/update/query
 * route组件
 */
export class VsPortPropRouteMeta {
  // @ApiProperty({ description: '源', enum: VsPortRouteMetaSourceTypeEnum })
  @IsNotEmpty({ message: '源不能为空' })
  @IsEnum(VsPortRouteMetaSourceTypeEnum)
  source: VsPortRouteMetaSourceTypeEnum;

  // @ApiProperty({ description: '键' })
  @IsNotEmpty({ message: '键不能为空' })
  @IsString()
  @Length(1, 64, { message: '键长度为1到64' })
  key: string;

  // @ApiProperty({ description: '值类型', enum: VsPortRouteMetaDataTypeEnum })
  @IsNotEmpty({ message: '值类型不能为空' })
  @IsEnum(VsPortRouteMetaDataTypeEnum)
  dataType: VsPortRouteMetaDataTypeEnum;

  // @ApiProperty({ description: '运算符', enum: VsPortRouteMetaOpTypeEnum })
  @IsNotEmpty({ message: '运算符不能为空' })
  @IsEnum(VsPortRouteMetaOpTypeEnum)
  op: VsPortRouteMetaOpTypeEnum;

  // @ApiProperty({ description: '右值' })
  @IsNotEmpty({ message: '右值不能为空' })
  @IsString()
  rightValue: string;
}
