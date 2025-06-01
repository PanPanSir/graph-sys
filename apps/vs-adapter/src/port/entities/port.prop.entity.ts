import { VsPortPropContext } from './port-prop-context.entity.js';
import { VsPortPropDataMapping } from './port-prop-data-mapping.entity.js';
import { VsPortPropHttp } from './port-prop-http.entity.js';
import { VsPortPropReqHeader } from './port-prop-req-header.entity.js';
import { VsPortPropRoute } from './port-prop-route.entity.js';
import { VsPortPropRspHeader } from './port-prop-rsp-header.entity.js';

export class VsPortProp {
  //// @ApiProperty({ description: '自定义脚本' })
  script?: string;

  // @ApiProperty({ description: '其他定义,在call方法外部' })
  additionDefine?: string;

  // @ApiProperty({ description: '端口名' })
  name: string;

  // @ApiProperty({ description: '端口序' })
  order: number;

  // @ApiProperty({ description: '路由属性(分发)' })
  route?: VsPortPropRoute;

  // @ApiProperty({ description: 'http属性' })
  http?: VsPortPropHttp;

  // @ApiProperty({ description: 'context属性' })
  context?: VsPortPropContext;

  // @ApiProperty({ description: '请求头属性(操作请求头)' })
  reqHeader?: VsPortPropReqHeader;

  // @ApiProperty({ description: '响应头属性(操作响应头)' })
  rspHeader?: VsPortPropRspHeader;

  //// @ApiProperty({ description: '数据转换组件属性' })
  dataMapping?: VsPortPropDataMapping;
}
