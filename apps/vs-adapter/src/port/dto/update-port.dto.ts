import { IsString, IsNotEmpty, ValidateNested, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { VsPortProp } from './VsPortProp';
import { VsPort } from '../entities/port.entity';

export class UpdatePortDto {
  @IsNotEmpty({
    message: '端口ID不能为空',
  })
  @IsString()
  @Length(1, 64, { message: '端口ID在1到64个字符之间' })
  id: string;

  @IsNotEmpty({
    message: '属性不能为空',
  })
  @ValidateNested()
  @Type(() => VsPortProp)
  properties: VsPortProp;

  toVsPort() {
    const vsPort = new VsPort();
    vsPort.id = this.id;

    if (this.properties?.context != null) {
      // const apiId = this.properties.context.contextCompApiId;
      // vsPort.contextCompApiId = apiId;
      const method = this.properties.context.method;
      vsPort.method = method;
      const path = this.properties.context.path;
      vsPort.path = path;
    }

    if (this.properties?.http != null) {
      // const apiId = this.properties.http.httpCompApiId;
      // vsPort.httpCompApiId = apiId;
      const { method, requestTimeout } = this.properties.http;
      vsPort.method = method;
      vsPort.requestTimeout = requestTimeout;
    }

    if (this.properties?.dataMapping != null) {
      vsPort.sourceApiType = this.properties.dataMapping.sourceApiType;
      vsPort.sourceApiId = this.properties.dataMapping.sourceApiId;
      vsPort.targetApiType = this.properties.dataMapping.targetApiType;
      vsPort.targetApiId = this.properties.dataMapping.targetApiId;
    }

    vsPort.properties = this.properties as any;

    return vsPort;
  }
}
