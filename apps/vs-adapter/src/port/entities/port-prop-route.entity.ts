import { VsPortPropRouteMeta } from './port-prop-route-meta.entity';

export class VsPortPropRoute {
  // @ApiProperty({ description: 'meta属性' })
  // @Column('json')
  // @ValidateNested({ each: true })
  // @Type(() => VsPortPropRouteMeta)
  meta?: VsPortPropRouteMeta[];
}
