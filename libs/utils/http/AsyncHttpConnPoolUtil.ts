import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as https from 'https';
import * as http from 'http';
import * as FormData from 'form-data';

export interface Header {
  name: string;
  value: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface MultiValueMap<K, V> {
  [key: string]: V[];
}
// 抽象基类，对应Java的HttpEntityEnclosingRequestBase
abstract class HttpEntityEnclosingRequestBase {
  private uri: string;
  private entity: any;
  private headers: Map<string, Header[]> = new Map();
  private config?: any;

  constructor() {
    // 对应Java的super()调用
  }

  // 抽象方法，子类必须实现
  abstract getMethod(): string;

  // 设置URI
  setURI(uri: string): void {
    this.uri = uri;
  }

  getURI(): string {
    return this.uri;
  }

  // 设置请求体，对应Java的setEntity
  setEntity(entity: any): void {
    this.entity = entity;
  }

  getEntity(): any {
    return this.entity;
  }

  // 添加请求头
  addHeader(
   header: Header,
  ) {
    if(!this.headers[header.name]) {
      this.headers[header.name] = [];
    }
    this.headers[header.name].push(header.value);
  }

  // 获取所有请求头
    // 获取所有请求头
    getAllHeaders(): Record<string, string[] | string> {
      const axiosHeaders: Record<string, string> = {};

      for (const key in this.headers) {
        if (key === 'Set-Cookie') {
          //单独处理 Set-Cookie，留成数组
          continue;
        }
        axiosHeaders[key] = this.headers[key].join(', ');
      }
      return axiosHeaders;
    }

  // 设置请求配置
  setConfig(config: any): void {
    this.config = config;
  }

  getConfig(): any {
    return this.config;
  }
}

/**
 * use axios library to do http request
 */
@Injectable()
export class AsyncHttpConnPoolUtil {
  private static readonly logger = new Logger(AsyncHttpConnPoolUtil.name);

  // 最大连接数
  private static readonly MAX_TOTAL = 5000;
  // 每个域名每次能并行接收的请求数量
  private static readonly DEFAULT_MAX_PER_ROUTE = 200;
  // 客户端和服务器建立连接超时时间(ms)
  private static readonly CONNECT_TIMEOUT = 10_000;
  // 从连接池获取连接超时时间(ms)
  // request从创建到被eventloop消费到的最大时间，如果追求高吞吐而导致延迟高，这个排队时间要给大一些
  private static readonly CONNECTION_REQUEST_TIMEOUT = 60_000;
  // 客户端和服务器建立连接后，客户端从服务器读取数据超时时间(ms)
  private static readonly SOCKET_TIMEOUT = 60_000;

  private static asyncHttpClient: AxiosInstance;

  static {
    try {
      AsyncHttpConnPoolUtil.asyncHttpClient =
        AsyncHttpConnPoolUtil.getAsyncHttpClient();
    } catch (ex) {
      AsyncHttpConnPoolUtil.logger.error(
        'http connection pool init failed',
        ex,
      );
      process.exit(-1);
    } finally {
      AsyncHttpConnPoolUtil.logger.log('http connection pool init success.');
    }
  }

  private constructor() {
    throw new Error('Utility class');
  }

  public static getAsyncHttpClient(): AxiosInstance {
    // // 配置超时和连接池
    // const httpsAgent = new https.Agent({
    //   maxSockets: AsyncHttpConnPoolUtil.DEFAULT_MAX_PER_ROUTE,
    //   maxTotalSockets: AsyncHttpConnPoolUtil.MAX_TOTAL,
    //   keepAlive: true,
    //   rejectUnauthorized: false, // 对应Java的TrustSelfSignedStrategy
    // });

    // return axios.create({
    //   timeout: AsyncHttpConnPoolUtil.SOCKET_TIMEOUT,
    //   httpsAgent: httpsAgent,
    //   // 对应Java的RequestConfig
    //   // connectTimeout在Node.js中通过httpsAgent的timeout处理
    // });
      // HTTP Agent 配置
  const httpAgent = new http.Agent({
    maxSockets: AsyncHttpConnPoolUtil.DEFAULT_MAX_PER_ROUTE, // 每个域名最大连接数
    maxTotalSockets: AsyncHttpConnPoolUtil.MAX_TOTAL, // 总最大连接数
    keepAlive: true, // 启用连接复用
    timeout: AsyncHttpConnPoolUtil.CONNECT_TIMEOUT, // 连接超时
    keepAliveMsecs: 30000, // Keep-Alive 超时时间
    maxFreeSockets: 10, // 最大空闲连接数
    scheduling: 'fifo' // 连接调度策略
  });

  // HTTPS Agent 配置
  const httpsAgent = new https.Agent({
    maxSockets: AsyncHttpConnPoolUtil.DEFAULT_MAX_PER_ROUTE,
    maxTotalSockets: AsyncHttpConnPoolUtil.MAX_TOTAL,
    keepAlive: true,
    timeout: AsyncHttpConnPoolUtil.CONNECT_TIMEOUT, // 添加连接超时
    keepAliveMsecs: 30000, // Keep-Alive 超时时间
    maxFreeSockets: 10, // 最大空闲连接数
    rejectUnauthorized: false, // 对应Java的TrustSelfSignedStrategy
    scheduling: 'fifo' // 连接调度策略
  });

  return axios.create({
    timeout: AsyncHttpConnPoolUtil.SOCKET_TIMEOUT, // 请求超时
    httpAgent: httpAgent, // 添加 HTTP Agent
    httpsAgent: httpsAgent,
    maxRedirects: 5, // 最大重定向次数
    maxContentLength: 50 * 1024 * 1024, // 最大响应体大小 50MB
    maxBodyLength: 50 * 1024 * 1024, // 最大请求体大小 50MB
    // 对应Java的RequestConfig
    validateStatus: (status) => status < 500, // 只有5xx才认为是错误
  });
  }

  public static async doGet(
    url: string,
    timeout: number,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const httpGetWithEntity = new HttpGetWithEntity(url);
    return AsyncHttpConnPoolUtil.execute(
      httpGetWithEntity,
      null,
      timeout,
      headers,
    );
  }

  /**
   * JSON/XML/PLAIN 格式的POST请求
   *
   * @param url
   * @param requestBody
   * @param headers
   */
  public static async doPost(
    url: string,
    requestBody: string,
    timeout: number,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const stringEntity = requestBody; // 对应Java的StringEntity
    return AsyncHttpConnPoolUtil.doInternalPost(
      url,
      stringEntity,
      120,
      headers,
    );
  }

  /**
   * URL编码格式的POST请求
   *
   * @param url
   * @param params
   * @param headers
   */
  public static async doPostUrlEncodedData(
    url: string,
    params: Record<string, string>,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const urlEncodedFormEntity = new URLSearchParams(params).toString();
    return AsyncHttpConnPoolUtil.doInternalPost(
      url,
      urlEncodedFormEntity,
      120,
      headers,
    );
  }

  /**
   * 表单格式的POST请求（文本）
   *
   * @param url
   * @param params
   * @param headers
   */
  public static async doPostFormDataInText(
    url: string,
    params: Record<string, string>,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const multipartEntityBuilder = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      AsyncHttpConnPoolUtil.addTextBody(multipartEntityBuilder, key, value);
    });
    const httpEntity = multipartEntityBuilder;
    return AsyncHttpConnPoolUtil.doInternalPost(url, httpEntity, 120, headers);
  }

  /**
   * 表单格式的POST请求（二进制）
   *
   * @param url
   * @param params
   * @param headers
   */
  public static async doPostFormDataInByteArray(
    url: string,
    params: Record<string, Buffer>,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const multipartEntityBuilder = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      AsyncHttpConnPoolUtil.addBinaryBody(multipartEntityBuilder, key, value);
    });
    const httpEntity = multipartEntityBuilder;
    return AsyncHttpConnPoolUtil.doInternalPost(url, httpEntity, 120, headers);
  }

  /**
   * 表单格式的POST请求（混合）
   *
   * @param url
   * @param textParams
   * @param binaryParams
   * @param headers
   */
  public static async doPostFormData(
    url: string,
    textParams?: Record<string, string>,
    binaryParams?: Record<string, Buffer>,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const multipartEntityBuilder = new FormData();

    if (textParams) {
      Object.entries(textParams).forEach(([key, value]) => {
        AsyncHttpConnPoolUtil.addTextBody(multipartEntityBuilder, key, value);
      });
    }

    if (binaryParams) {
      Object.entries(binaryParams).forEach(([key, value]) => {
        AsyncHttpConnPoolUtil.addBinaryBody(multipartEntityBuilder, key, value);
      });
    }

    const httpEntity = multipartEntityBuilder;
    return AsyncHttpConnPoolUtil.doInternalPost(url, httpEntity, 120, headers);
  }

  /**
   * 表单格式的PUT请求（文本）
   *
   * @param url
   * @param params
   * @param headers
   */
  public static async doPutFormDataInText(
    url: string,
    params: Record<string, string>,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const multipartEntityBuilder = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      AsyncHttpConnPoolUtil.addTextBody(multipartEntityBuilder, key, value);
    });
    const httpEntity = multipartEntityBuilder;
    return AsyncHttpConnPoolUtil.doInternalPut(url, httpEntity, 120, headers);
  }

  /**
   * 表单格式的PUT请求（混合）
   *
   * @param url
   * @param textParams
   * @param binaryParams
   * @param headers
   */
  public static async doPutFormData(
    url: string,
    textParams?: Record<string, string>,
    binaryParams?: Record<string, Buffer>,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const multipartEntityBuilder = new FormData();

    if (textParams) {
      Object.entries(textParams).forEach(([key, value]) => {
        AsyncHttpConnPoolUtil.addTextBody(multipartEntityBuilder, key, value);
      });
    }

    if (binaryParams) {
      Object.entries(binaryParams).forEach(([key, value]) => {
        AsyncHttpConnPoolUtil.addBinaryBody(multipartEntityBuilder, key, value);
      });
    }

    const httpEntity = multipartEntityBuilder;
    return AsyncHttpConnPoolUtil.doInternalPut(url, httpEntity, 120, headers);
  }

  private static async doInternalPost(
    url: string,
    httpEntity: any,
    timeout: number,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const httpPost = new HttpPost(url);
    return AsyncHttpConnPoolUtil.execute(
      httpPost,
      httpEntity,
      timeout,
      headers,
    );
  }

  private static async doInternalPut(
    url: string,
    httpEntity: any,
    timeout: number,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    const httpPut = new HttpPut(url);
    return AsyncHttpConnPoolUtil.execute(httpPut, httpEntity, timeout, headers);
  }

  private static addTextBody(
    multipartEntityBuilder: FormData,
    name: string,
    text: string,
  ): void {
    multipartEntityBuilder.append(name, text);
  }

  private static addBinaryBody(
    multipartEntityBuilder: FormData,
    name: string,
    body: Buffer,
  ): void {
    multipartEntityBuilder.append(name, body);
  }

  private static async execute(
    httpEntityEnclosingRequestBase: HttpEntityEnclosingRequestBase,
    httpEntity: any,
    timeout: number,
    headers?: Map<string, Header[]>,
  ): Promise<AxiosResponse> {
    // 设置请求体
    if (httpEntity) {
      httpEntityEnclosingRequestBase.setEntity(httpEntity);
    }


  // 设置headers
  if (headers) {
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [key, arr] of headers) {
        for (const item of arr) {
          httpEntityEnclosingRequestBase.addHeader({name: item.name, value: item.value});
        }
      }
  }

    try {
      const config: AxiosRequestConfig = {
        method: httpEntityEnclosingRequestBase.getMethod(),
        url: httpEntityEnclosingRequestBase.getURI(),
        data: httpEntityEnclosingRequestBase.getEntity(),
        headers: httpEntityEnclosingRequestBase.getAllHeaders(),
        timeout,
      };

      console.log(`发起请求:config`, config);
      const response =
        await AsyncHttpConnPoolUtil.asyncHttpClient.request(config);
      // console.log(`请求结果:response`, response);
      return response;
    } catch (error) {
      console.error(`请求失败:error`, error);
      throw error;
    }
  }

  // 对应Java的main方法，用于测试
  public static async main(): Promise<void> {
    const startTime = Date.now();
    AsyncHttpConnPoolUtil.logger.log(
      `开始时间: ${new Date(startTime).toLocaleString()}`,
    );

    try {
      const response = await AsyncHttpConnPoolUtil.doGet(
        'https://httpbin.org/get',
        1200,
      );
      AsyncHttpConnPoolUtil.logger.log(`响应状态: ${response.status}`);
      AsyncHttpConnPoolUtil.logger.log(
        `响应数据: ${JSON.stringify(response.data)}`,
      );
    } catch (error) {
      AsyncHttpConnPoolUtil.logger.error('请求失败', error);
    }

    const endTime = Date.now();
    AsyncHttpConnPoolUtil.logger.log(
      `结束时间: ${new Date(endTime).toLocaleString()}`,
    );
    AsyncHttpConnPoolUtil.logger.log(`总耗时: ${endTime - startTime}ms`);
  }
}

// 对应Java的HttpGetWithEntity类
class HttpGetWithEntity extends HttpEntityEnclosingRequestBase {
  constructor(uri: string) {
    super();
    this.setURI(uri);
  }

  getMethod(): string {
    return 'GET';
  }
}

// 对应Java的HttpPut类
class HttpPut extends HttpEntityEnclosingRequestBase {
  constructor(uri: string) {
    super();
    this.setURI(uri);
  }

  getMethod(): string {
    return 'PUT';
  }
}

class HttpPost extends HttpEntityEnclosingRequestBase {
  static readonly METHOD_NAME = 'POST';

  constructor(uri: string) {
    super();
    this.setURI(uri);
  }

  getMethod(): string {
    return HttpPost.METHOD_NAME;
  }
}
