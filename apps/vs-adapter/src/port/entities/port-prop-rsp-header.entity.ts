import { VsPortPropRspHeaderMeta } from './port-prop-rsp-header-meta.entity';

export class VsPortPropRspHeader {
  // @ApiProperty({ description: 'meta属性' })
  // @Column('json')
  // @ValidateNested({ each: true })
  // @Type(() => VsPortPropRspHeaderMeta)
  meta?: VsPortPropRspHeaderMeta[];
}
