import {
  VsApiTypeEnum,
  VsDataConvertTypeEnum,
} from '@app/enum//data.mapping.enum';
import { VsDataConvProp } from './data-conv-prop.entity';

export class VsPortPropDataMapping {
  // @ApiProperty({ description: '数据转换配置中源数据格式对应的接口类型' })
  // @Column('enum', { enum: VsApiTypeEnum })
  sourceApiType?: VsApiTypeEnum;

  // @ApiProperty({ description: '数据转换配置中目标数据格式对应的接口类型' })
  // @Column('enum', { enum: VsApiTypeEnum })
  targetApiType?: VsApiTypeEnum;

  // @ApiProperty({ description: '数据转换配置中源数据格式对应的源接口ID' })
  // @Column('bigint', { nullable: true })
  sourceApiId?: number;

  // @ApiProperty({ description: '数据转换配置中目标数据格式对应的目标接口ID' })
  // @Column('bigint', { nullable: true })
  targetApiId?: number;

  // @ApiProperty({ description: '转换组件中源类型' })
  // @Column('enum', { enum: VsDataConvertTypeEnum })
  sourceConvertType?: VsDataConvertTypeEnum;

  // @ApiProperty({ description: '转换组件中目标类型' })
  // @Column('enum', { enum: VsDataConvertTypeEnum })
  targetConvertType?: VsDataConvertTypeEnum;

  // @ApiProperty({ description: '转换配置' })
  // @Column(() => VsDataConvProp)
  // @ValidateNested()
  // @Type(() => VsDataConvProp)
  vsDataConvProp?: VsDataConvProp;
}
