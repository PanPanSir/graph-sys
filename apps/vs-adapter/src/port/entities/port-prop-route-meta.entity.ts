import {
  VsPortRouteMetaDataTypeEnum,
  VsPortRouteMetaOpTypeEnum,
  VsPortRouteMetaSourceTypeEnum,
} from '../../common/enums/port.route.enum';

export class VsPortPropRouteMeta {
  // @ApiProperty({ description: '源' })
  // @Column('enum', { enum: VsPortRouteMetaSourceTypeEnum })
  // @IsNotEmpty({ message: '源不能为空' })
  source: VsPortRouteMetaSourceTypeEnum;

  // @ApiProperty({ description: '键' })
  // @Column('varchar', { length: 64 })
  // @IsNotEmpty({ message: '键不能为空' })
  // @Length(1, 64, { message: '键长度为1到64' })
  key: string;

  // @ApiProperty({ description: '值类型' })
  // @Column('enum', { enum: VsPortRouteMetaDataTypeEnum })
  // @IsNotEmpty({ message: '值类型不能为空' })
  dataType: VsPortRouteMetaDataTypeEnum;

  // @ApiProperty({ description: '运算符' })
  // @Column('enum', { enum: VsPortRouteMetaOpTypeEnum })
  // @IsNotEmpty({ message: '运算符不能为空' })
  op: VsPortRouteMetaOpTypeEnum;

  // @ApiProperty({ description: '右值' })
  // @Column('varchar')
  // @IsNotEmpty({ message: '右值不能为空' })
  rightValue: string;
}
