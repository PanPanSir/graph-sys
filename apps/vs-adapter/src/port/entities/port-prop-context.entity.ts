import { VsHttpMethodEnum } from '@app/enum/port.enum';

export class VsPortPropContext {
  // @ApiProperty({ description: 'CONTEXT组件的接口ID' })
  // @Column('bigint')
  // @IsNotEmpty({ message: '接口ID不能为空' })
  // contextCompApiId: number;
  // contextCompApiId: number;

  // @ApiProperty({ description: '请求方式' })
  // @Column('enum', { enum: VsHttpMethodEnum })
  method?: VsHttpMethodEnum;

  // @ApiProperty({ description: '路径' })
  // @Column('varchar')
  path?: string;
}
