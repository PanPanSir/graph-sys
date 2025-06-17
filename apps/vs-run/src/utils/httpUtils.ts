import { Request } from 'express';
import { Injectable } from '@nestjs/common';

/**
 * HTTP工具类 - NestJS版本
 * 从Java HttpUtil转换而来
 */
@Injectable()
export class HttpUtil {
  /**
   * HTTPClient的请求头构造
   *
   * @param request Express Request对象
   * @returns 处理后的请求头映射
   */
  static makeRequestHeaderMap(request: Request): Record<string, string> {
    const headerMap: Record<string, string> = {};

    // 遍历所有请求头
    for (const [name, value] of Object.entries(request.headers)) {
      // skip content-length header, because httpclient will auto set.
      if (name.toLowerCase() === 'content-length') {
        continue;
      }

      // skip accept-encoding header to ignore zip stream.
      if (name.toLowerCase() === 'accept-encoding') {
        continue;
      }

      // skip content-type(only form-data) header, because httpclient will auto set.
      if (name.toLowerCase() === 'content-type') {
        const contentType = request.get('content-type');
        if (contentType && contentType.length > 0) {
          // 检查是否为multipart/form-data类型
          if (contentType.toLowerCase().includes('multipart/form-data')) {
            continue;
          }
        }
      }

      // add header, only first header value is set.
      if (Array.isArray(value)) {
        // 如果是数组，只取第一个值
        if (value.length > 0) {
          headerMap[name] = value[0];
        }
      } else if (typeof value === 'string') {
        // 如果是字符串，直接使用
        headerMap[name] = value;
      }
    }

    return headerMap;
  }
}

// 导出静态方法以便直接使用
export const makeRequestHeaderMap = HttpUtil.makeRequestHeaderMap;
