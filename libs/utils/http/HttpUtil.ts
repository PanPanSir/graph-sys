import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';

/**
 * 涉及Http相关的方法,无连接池
 * !!! DO NOT MODIFY THIS FILE !!!
 */
@Injectable()
export class HttpUtil {
  private readonly logger = new Logger(HttpUtil.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * 发送GET请求
   * @param urlWithParams 带参数的完整URL
   * @param headers 请求头
   * @returns 响应体字符串
   */
  async sendGet(
    urlWithParams: string,
    headers: Record<string, string> = {},
  ): Promise<string> {
    try {
      const config: AxiosRequestConfig = {
        headers,
        timeout: 30000, // 30秒超时
      };

      const response: AxiosResponse<string> = await firstValueFrom(
        this.httpService.get(urlWithParams, config),
      );

      if (response.status !== 200) {
        this.logger.error(
          `request ${urlWithParams} failed, code = ${response.status}`,
        );
        throw new Error(`HTTP ${response.status}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`request ${urlWithParams} failed`, error);
      throw new Error(`请求[${urlWithParams}]失败,msg=${error.message}`);
    }
  }

  /**
   * 发送POST JSON请求
   * @param urlWithParams 带参数的完整URL
   * @param data JSON数据
   * @param headers 请求头
   * @returns 响应体字符串
   */
  async sendPostJson(
    urlWithParams: string,
    data: string,
    headers: Record<string, string> = {},
  ): Promise<string> {
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: 30000,
      };

      const response: AxiosResponse<string> = await firstValueFrom(
        this.httpService.post(urlWithParams, data, config),
      );

      if (response.status !== 200) {
        this.logger.error(
          `request ${urlWithParams} failed, code = ${response.status}`,
        );
        throw new Error(`HTTP ${response.status}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`request ${urlWithParams} failed`, error);
      throw new Error(`请求[${urlWithParams}]失败,msg=${error.message}`);
    }
  }

  /**
   * 发送POST URL编码请求
   * @param urlWithParams 带参数的完整URL
   * @param data 表单数据
   * @param headers 请求头
   * @returns 响应体字符串
   */
  async sendPostUrlEncoded(
    urlWithParams: string,
    data: Record<string, string | string[]>,
    headers: Record<string, string> = {},
  ): Promise<string> {
    try {
      // 将数据转换为URLSearchParams格式
      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });

      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...headers,
        },
        timeout: 30000,
      };

      const response: AxiosResponse<string> = await firstValueFrom(
        this.httpService.post(urlWithParams, formData.toString(), config),
      );

      if (response.status !== 200) {
        this.logger.error(
          `request ${urlWithParams} failed, code = ${response.status}`,
        );
        throw new Error(`HTTP ${response.status}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`request ${urlWithParams} failed`, error);
      throw new Error(`请求[${urlWithParams}]失败,msg=${error.message}`);
    }
  }

  /**
   * 发送PUT请求
   * @param urlWithParams 带参数的完整URL
   * @param data 表单数据
   * @param headers 请求头
   * @returns 响应体字符串
   */
  async sendPut(
    urlWithParams: string,
    data: Record<string, string | string[]>,
    headers: Record<string, string> = {},
  ): Promise<string> {
    try {
      // 将数据转换为URLSearchParams格式
      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });

      const config: AxiosRequestConfig = {
        headers,
        timeout: 30000,
      };

      const response: AxiosResponse<string> = await firstValueFrom(
        this.httpService.put(urlWithParams, formData.toString(), config),
      );

      if (response.status !== 200) {
        this.logger.error(
          `request ${urlWithParams} failed, code = ${response.status}`,
        );
        throw new Error(`HTTP ${response.status}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`request ${urlWithParams} failed`, error);
      throw new Error(`请求[${urlWithParams}]失败,msg=${error.message}`);
    }
  }

  /**
   * 根据URL和参数映射生成带参数的URL
   * used
   * DO NOT change this method.
   * @param url 基础URL
   * @param paramMap 参数映射
   * @returns 带参数的完整URL
   */
  static makeUrlWithParams(url: string, paramMap: Map<string, string>): string {
    const paramStr = this.buildQueryParamStr(paramMap);
    return url + paramStr;
  }

  /**
   * 根据请求参数,返回请求参数字符串
   * DO NOT change this method
   * @param queryParams 查询参数映射
   * @returns 查询参数字符串
   */
  private static buildQueryParamStr(queryParams: Map<string, string>): string {
    const params: string[] = [];

    Object.entries(queryParams).forEach(([paramKey, paramVal]) => {
      if (paramVal !== null && paramVal !== undefined) {
        params.push(`${paramKey}=${paramVal}`);
      } else {
        params.push(`${paramKey}=`);
      }
    });

    const paramStr = params.join('&');
    return paramStr.length > 0 ? `?${paramStr}` : '';
  }
}
