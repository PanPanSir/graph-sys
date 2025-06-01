import { VsPortRspHeaderMetaOpTypeEnum } from '../../common/enums/port.enum';

export class VsPortPropRspHeaderMeta {
  // @ApiProperty({ description: '键' })
  // @Column('varchar', { length: 64 })
  // @IsNotEmpty({ message: '键不能为空' })
  // @Length(1, 64, { message: '键长度为1到64' })
  key: string;

  // @ApiProperty({ description: '操作类型' })
  // @Column('enum', { enum: VsPortRspHeaderMetaOpTypeEnum })
  // @IsNotEmpty({ message: '操作类型不能为空' })
  op: VsPortRspHeaderMetaOpTypeEnum;

  // @ApiProperty({ description: '值' })
  // @Column('varchar', { nullable: true })
  value?: string;
}
