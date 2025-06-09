import { VsPortReqHeaderMetaOpTypeEnum } from '@app/enum//port.enum';

export class VsPortPropReqHeaderMeta {
  // @ApiProperty({ description: '键' })
  // @Column('varchar', { length: 64 })
  // @IsNotEmpty({ message: '键不能为空' })
  // @Length(1, 64, { message: '键长度为1到64' })
  key: string;

  // @ApiProperty({ description: '操作类型' })
  // @Column('enum', { enum: VsPortReqHeaderMetaOpTypeEnum })
  // @IsNotEmpty({ message: '操作类型不能为空' })
  op: VsPortReqHeaderMetaOpTypeEnum;

  // @ApiProperty({ description: '值' })
  // @Column('varchar', { nullable: true })
  value?: string;
}
