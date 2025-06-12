import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import * as https from 'https';
import * as http from 'http';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MultiValueMap<_K, V> {
  [key: string]: V[];
}

interface HttpHeader {
  name: string;
  value: string;
}

@Injectable()
export class AsyncHttpConnPoolUtil {
  private readonly logger = new Logger(AsyncHttpConnPoolUtil.name);

  // 最大连接数
  private static readonly MAX_TOTAL = 5000;
  // 每个域名每次能并行接收的请求数量
  private static readonly DEFAULT_MAX_PER_ROUTE = 200;
  // 客户端和服务器建立连接超时时间(ms)
  private static readonly CONNECT_TIMEOUT = 10_000;
  // 从连接池获取连接超时时间(ms)
  private static readonly CONNECTION_REQUEST_TIMEOUT = 60_000;
  // 客户端和服务器建立连接后，客户端从服务器读取数据超时时间(ms)
  private static readonly SOCKET_TIMEOUT = 60_000;

  private httpAgent: http.Agent;
  private httpsAgent: https.Agent;

  constructor(private readonly httpService: HttpService) {
    this.initializeAgents();
    this.logger.log('HTTP connection pool initialized successfully.');
  }

  private initializeAgents(): void {
    // 配置HTTP Agent
    this.httpAgent = new http.Agent({
      keepAlive: true,
      maxSockets: AsyncHttpConnPoolUtil.DEFAULT_MAX_PER_ROUTE,
      maxTotalSockets: AsyncHttpConnPoolUtil.MAX_TOTAL,
      timeout: AsyncHttpConnPoolUtil.SOCKET_TIMEOUT,
    });

    // 配置HTTPS Agent
    this.httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: AsyncHttpConnPoolUtil.DEFAULT_MAX_PER_ROUTE,
      maxTotalSockets: AsyncHttpConnPoolUtil.MAX_TOTAL,
      timeout: AsyncHttpConnPoolUtil.SOCKET_TIMEOUT,
      rejectUnauthorized: false, // 等同于Java中的TrustSelfSignedStrategy
    });
  }

  private getBaseConfig(): AxiosRequestConfig {
    return {
      timeout: AsyncHttpConnPoolUtil.SOCKET_TIMEOUT,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      maxRedirects: 5,
    };
  }

  private convertHeaders(
    headers?: MultiValueMap<string, HttpHeader>,
  ): Record<string, string> {
    if (!headers) return {};

    const result: Record<string, string> = {};
    for (const [key, headerList] of Object.entries(headers)) {
      if (headerList && headerList.length > 0) {
        // 如果有多个相同名称的header，用逗号分隔
        result[key] = headerList.map((h) => h.value).join(', ');
      }
    }
    return result;
  }

  /**
   * GET请求
   */
  async doGet(
    url: string,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    try {
      const config: AxiosRequestConfig = {
        ...this.getBaseConfig(),
        method: 'GET',
        url,
        headers: this.convertHeaders(headers),
      };

      return await firstValueFrom(this.httpService.request(config));
    } catch (error) {
      this.logger.error(
        `GET request failed, url = ${url}, headers = ${JSON.stringify(headers)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * JSON/XML/PLAIN 格式的POST请求
   */
  async doPost(
    url: string,
    body?: string,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    try {
      const config: AxiosRequestConfig = {
        ...this.getBaseConfig(),
        method: 'POST',
        url,
        data: body,
        headers: this.convertHeaders(headers),
      };

      return await firstValueFrom(this.httpService.request(config));
    } catch (error) {
      this.logger.error(
        `POST request failed, url = ${url}, headers = ${JSON.stringify(headers)}`,
        error,
      );
      throw error;
    }
  }

  /**
   * x-www-form-urlencoded 类型的POST请求
   */
  async doPostUrlEncodedData(
    url: string,
    body?: MultiValueMap<string, string>,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    try {
      const params = new URLSearchParams();
      if (body) {
        for (const [key, values] of Object.entries(body)) {
          if (!values || values.length === 0) {
            params.append(key, '');
          } else {
            for (const value of values) {
              params.append(key, value || '');
            }
          }
        }
      }

      const config: AxiosRequestConfig = {
        ...this.getBaseConfig(),
        method: 'POST',
        url,
        data: params.toString(),
        headers: {
          ...this.convertHeaders(headers),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      return await firstValueFrom(this.httpService.request(config));
    } catch (error) {
      this.logger.error(`POST URL-encoded request failed, url = ${url}`, error);
      throw error;
    }
  }

  /**
   * 文本形式的FormData POST请求
   */
  async doPostFormDataInText(
    url: string,
    body?: MultiValueMap<string, string>,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    return this.doPostFormData(url, body, undefined, headers);
  }

  /**
   * 二进制形式的FormData POST请求
   */
  async doPostFormDataInByteArray(
    url: string,
    body?: MultiValueMap<string, Buffer>,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    return this.doPostFormData(url, undefined, body, headers);
  }

  /**
   * FormData POST请求（支持文本和二进制）
   */
  async doPostFormData(
    url: string,
    textBody?: MultiValueMap<string, string>,
    binaryBody?: MultiValueMap<string, Buffer>,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    try {
      const formData = new FormData();

      // 添加文本字段
      if (textBody) {
        this.addTextBodyToFormData(textBody, formData);
      }

      // 添加二进制字段
      if (binaryBody) {
        this.addBinaryBodyToFormData(binaryBody, formData);
      }

      const config: AxiosRequestConfig = {
        ...this.getBaseConfig(),
        method: 'POST',
        url,
        data: formData,
        headers: {
          ...this.convertHeaders(headers),
          ...formData.getHeaders(),
        },
      };

      return await firstValueFrom(this.httpService.request(config));
    } catch (error) {
      this.logger.error(`POST FormData request failed, url = ${url}`, error);
      throw error;
    }
  }

  /**
   * 文本形式的FormData PUT请求
   */
  async doPutFormDataInText(
    url: string,
    body?: MultiValueMap<string, string>,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    return this.doPutFormData(url, body, undefined, headers);
  }

  /**
   * FormData PUT请求（支持文本和二进制）
   */
  async doPutFormData(
    url: string,
    textBody?: MultiValueMap<string, string>,
    binaryBody?: MultiValueMap<string, Buffer>,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    try {
      const formData = new FormData();

      // 添加文本字段
      if (textBody) {
        this.addTextBodyToFormData(textBody, formData);
      }

      // 添加二进制字段
      if (binaryBody) {
        this.addBinaryBodyToFormData(binaryBody, formData);
      }

      const config: AxiosRequestConfig = {
        ...this.getBaseConfig(),
        method: 'PUT',
        url,
        data: formData,
        headers: {
          ...this.convertHeaders(headers),
          ...formData.getHeaders(),
        },
      };

      return await firstValueFrom(this.httpService.request(config));
    } catch (error) {
      this.logger.error(`PUT FormData request failed, url = ${url}`, error);
      throw error;
    }
  }

  /**
   * 通用执行方法
   */
  async execute(
    method: string,
    url: string,
    data?: any,
    headers?: MultiValueMap<string, HttpHeader>,
  ): Promise<AxiosResponse> {
    try {
      const config: AxiosRequestConfig = {
        ...this.getBaseConfig(),
        method: method as any,
        url,
        data,
        headers: this.convertHeaders(headers),
      };

      const response = await firstValueFrom(this.httpService.request(config));
      return response;
    } catch (error) {
      this.logger.error(
        `${method} request failed, url = ${url}, headers = ${JSON.stringify(headers)}`,
        error,
      );
      throw error;
    }
  }

  private addTextBodyToFormData(
    textBody: MultiValueMap<string, string>,
    formData: FormData,
  ): void {
    for (const [key, values] of Object.entries(textBody)) {
      if (!values || values.length === 0) {
        formData.append(key, '');
      } else {
        for (const value of values) {
          formData.append(key, value || '');
        }
      }
    }
  }

  private addBinaryBodyToFormData(
    binaryBody: MultiValueMap<string, Buffer>,
    formData: FormData,
  ): void {
    for (const [key, values] of Object.entries(binaryBody)) {
      if (!values || values.length === 0) {
        formData.append(key, Buffer.from(''), { filename: key });
      } else {
        for (const buffer of values) {
          formData.append(key, buffer || Buffer.from(''), { filename: key });
        }
      }
    }
  }

  /**
   * 获取连接池状态信息
   */
  getConnectionPoolStats(): {
    maxTotal: number;
    maxPerRoute: number;
    connectTimeout: number;
    socketTimeout: number;
  } {
    return {
      maxTotal: AsyncHttpConnPoolUtil.MAX_TOTAL,
      maxPerRoute: AsyncHttpConnPoolUtil.DEFAULT_MAX_PER_ROUTE,
      connectTimeout: AsyncHttpConnPoolUtil.CONNECT_TIMEOUT,
      socketTimeout: AsyncHttpConnPoolUtil.SOCKET_TIMEOUT,
    };
  }
}
