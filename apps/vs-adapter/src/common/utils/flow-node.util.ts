import { Injectable } from '@nestjs/common';

@Injectable()
export class FlowNodeUtil {
  static EXP_REQ_HEADER: string;
  static EXP_REQ_PARAM: string;
  // private readonly logger = new Logger(FlowNodeUtil.name);
  // // 常量定义
  // public static readonly MAX_DEPTH = 256;
  // public static readonly ALL_VALID_NODE_ID_KEY = 'ALL_VALID_NODE_ID_KEY';
  // public static readonly START_NODE_ID_KEY = 'START_NODE_ID_KEY';
  // public static readonly END_NODE_ID_KEY = 'END_NODE_ID_KEY';
  // // 表达式常量
  // public static readonly EXP_REQ_HEADER = 'this.getRequestHeader()';
  // public static readonly EXP_REQ_PARAM = 'this.getRequestParam()';
  // public static readonly EXP_OUTPUT_REQ_BODY = 'this.getOutputRequestBody()';
  // public static readonly EXP_OUTPUT_RSP_BODY = 'this.getOutputResponseBody()';
  // constructor(private readonly httpService: HttpService) {}
  // // 数据转换相关方法
  // public generateConvertDefaultMethodDefinition(methodName: string): string {
  //   return `
  //     public ${methodName}(source: string): string {
  //       return source;
  //     }
  //   `;
  // }
  // public generateConvertOutputReqBodyMethodDef(methodBody: string): string {
  //   return `
  //     public convertOutputReqBody(source: string): string {
  //       ${methodBody}
  //     }
  //   `;
  // }
  // public generateConvertGeneralMainMethodBody(
  //   sourceConvertType: VsDataConvertType,
  //   targetConvertType: VsDataConvertType,
  // ): string {
  //   const sourceVarName = 'source';
  //   const targetVarName = 'target';
  //   let sourceVarExp: string;
  //   switch (sourceConvertType) {
  //     case VsDataConvertType.REQ_PARAM:
  //       sourceVarExp = `const ${sourceVarName} = JSON.stringify(this.getRequestParam());`;
  //       break;
  //     case VsDataConvertType.REQ_BODY:
  //       sourceVarExp = `const ${sourceVarName} = this.getOutputRequestBody();`;
  //       break;
  //     case VsDataConvertType.RESP_BODY:
  //       sourceVarExp = `const ${sourceVarName} = this.getOutputResponseBody();`;
  //       break;
  //     default:
  //       throw new Error(`不支持的源类型${sourceConvertType}`);
  //   }
  //   const callMethodExp = `const ${targetVarName} = this.convertGeneral(${sourceVarName});`;
  //   let assignExp: string;
  //   switch (targetConvertType) {
  //     case VsDataConvertType.REQ_PARAM:
  //       assignExp = `
  //         const _target = JSON.parse(${targetVarName});
  //         Object.assign(this.getRequestParam(), _target);
  //       `;
  //       break;
  //     case VsDataConvertType.REQ_BODY:
  //       assignExp = `this.setOutputRequestBody(${targetVarName});`;
  //       break;
  //     case VsDataConvertType.RESP_BODY:
  //       assignExp = `this.setOutputResponseBody(${targetVarName});`;
  //       break;
  //     default:
  //       throw new Error(`不支持的目标类型${targetConvertType}`);
  //   }
  //   return `
  //     ${sourceVarExp}
  //     ${callMethodExp}
  //     ${assignExp}
  //   `;
  // }
  // // HTTP请求相关方法
  // public async executeHttpRequest(
  //   url: string,
  //   method: VsHttpMethod,
  //   headers: Record<string, string>,
  //   params: Record<string, string>,
  //   body?: string,
  //   timeout = 30000,
  //   circuitBreaker?: CircuitBreaker,
  // ): Promise<string> {
  //   const urlWithParams = this.makeUrlWithParams(url, params);
  //   try {
  //     const request = this.httpService.request({
  //       method,
  //       url: urlWithParams,
  //       headers,
  //       data: body,
  //       timeout,
  //     });
  //     const response = circuitBreaker
  //       ? await circuitBreaker.execute(() => firstValueFrom(request))
  //       : await firstValueFrom(request);
  //     if (response.status !== 200) {
  //       throw new Error(`状态码=${response.status},响应体=${response.data}`);
  //     }
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error(`Failed to request ${urlWithParams}`, error.stack);
  //     throw new Error(`请求失败: ${error.message}`);
  //   }
  // }
  // // 路由条件相关方法
  // public generateRouteCondition(
  //   leftValue: string,
  //   operator: string,
  //   rightValue: string,
  //   dataType: VsPortRouteMetaDataType,
  // ): string {
  //   switch (dataType) {
  //     case VsPortRouteMetaDataType.DOUBLE:
  //       return this.generateRouteDoubleCompare(leftValue, operator, rightValue);
  //     case VsPortRouteMetaDataType.INTEGER:
  //       return this.generateRouteLongCompare(leftValue, operator, rightValue);
  //     case VsPortRouteMetaDataType.STRING:
  //       return this.generateRouteStringCompare(leftValue, operator, rightValue);
  //     case VsPortRouteMetaDataType.DATETIME:
  //       return this.generateRouteDateTimeCompare(
  //         leftValue,
  //         operator,
  //         rightValue,
  //       );
  //     default:
  //       throw new Error(`不支持的数据类型: ${dataType}`);
  //   }
  // }
  // private generateRouteDoubleCompare(
  //   leftValue: string,
  //   operator: string,
  //   rightValue: string,
  // ): string {
  //   return `
  //     if (!VsPortRouteMetaDataType.match(${leftValue}, VsPortRouteMetaDataType.DOUBLE, this.getNodeId())) {
  //       return false;
  //     }
  //     if (!VsPortRouteMetaDataType.match("${rightValue}", VsPortRouteMetaDataType.DOUBLE, this.getNodeId())) {
  //       return false;
  //     }
  //     const v1 = parseFloat(${leftValue});
  //     const v2 = parseFloat("${rightValue}");
  //     return v1 ${operator} v2;
  //   `;
  // }
  // // 工具方法
  // private makeUrlWithParams(
  //   baseUrl: string,
  //   params: Record<string, string>,
  // ): string {
  //   const url = new URL(baseUrl);
  //   Object.entries(params).forEach(([key, value]) => {
  //     url.searchParams.append(key, value);
  //   });
  //   return url.toString();
  // }
}
