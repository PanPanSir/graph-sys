import { VsApiParamEnum } from '../../common/enums/data.mapping.enum';

export class VsApiReqParamProp {
  //  @ApiProperty({ description: '参数名字' })
  // @Column('varchar', { length: 64 })
  // @IsNotEmpty({ message: '参数名字不能为空' })
  // @Length(1, 64, { message: '参数名称长度在1到64个字符之间' })
  // @Matches(/^[a-zA-Z0-9_-]+$/, { message: '只支持数字，字母，下划线,-' })
  fieldName: string;

  // @ApiProperty({ description: '请求参数值的类型' })
  // @Column('enum', { enum: VsApiParamEnum })
  // @IsNotEmpty({ message: '参数值类型不能为空' })
  fieldType: VsApiParamEnum;

  // @ApiProperty({ description: '是否必填' })
  // @Column('boolean', { nullable: true })
  mandatory?: boolean;

  // @ApiProperty({ description: '参数描述' })
  // @Column('varchar', { length: 200, nullable: true })
  // @IsOptional()
  // @Length(0, 200, { message: '参数描述长度在0到200个字符之间' })
  desc?: string;
}
