import { VsPortPropReqHeaderMeta } from './port-prop-req-header-meta.entity';

export class VsPortPropReqHeader {
  // @ApiProperty({ description: 'meta属性' })
  // @Column('json')
  // @ValidateNested({ each: true })
  // @Type(() => VsPortPropReqHeaderMeta)
  meta?: VsPortPropReqHeaderMeta[];
}
