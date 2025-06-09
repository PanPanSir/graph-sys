import { DataConvertFieldTypeEnum } from '@app/enum//data.mapping.enum';
import { VsApiReqParamProp } from './api-req-param-prop.entity';

export class VsDataConvProp {
  // @ApiProperty({ description: '请求参数' })
  reqParams?: VsApiReqParamProp[];

  // @ApiProperty({ description: '请求体' })
  reqBody?: ReqBody;

  // @ApiProperty({ description: '响应体' })
  respBody?: RespBody;

  // @ApiProperty({ description: 'JSON格式,只用于前端解析' })
  _reqParams?: string;

  // @ApiProperty({ description: 'JSON格式,只用于前端解析' })
  _reqBody?: string;

  // @ApiProperty({ description: 'JSON格式,只用于前端解析' })
  _respBody?: string;
}

export class ReqBody {
  // @ApiProperty({ description: '字段名,代表了应该生成的JSON字段名字' })
  fieldName: string;

  // @ApiProperty({ description: '当前数据节点在JSON中的类型' })
  fieldType: DataConvertFieldTypeEnum;

  // @ApiProperty({ description: '字段描述' })
  desc?: string;

  // @ApiProperty({ description: '子节点描述' })
  children?: ReqBody[];
}

export class RespBody {
  // @ApiProperty({ description: '字段名,代表了应该生成的JSON字段名字' })
  fieldName: string;

  // @ApiProperty({ description: '当前数据节点在JSON中的类型' })
  fieldType: DataConvertFieldTypeEnum;

  // @ApiProperty({ description: '字段描述' })
  desc?: string;

  // @ApiProperty({ description: '子节点描述' })
  children?: RespBody[];
}
