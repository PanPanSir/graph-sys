
import { Transform, Type } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsEnum } from 'class-validator';
//
// import { VsNodeUserLog } from '../../../po/log/vs/vs-node-user-log';
import { VsNodeTaskTypeEnum } from '../../common/enums/node.enum';

/**
 * 图形化引擎的请求用户日志,存储于ES中
 * NestJS版本的用户日志保存请求对象
 */
export class VsNodeUserLogSaveReq {
  /**
   * 日志唯一标识符
   */
  @IsOptional()
  @IsString()
  id?: string;

  /**
   * 消息ID，用于幂等性控制
   */
  @IsOptional()
  @IsString()
  msgId?: string;

  /**
   * 节点ID
   */
  @IsOptional()
  @IsString()
  nodeId?: string;

  /**
   * 节点名称
   */
  @IsOptional()
  @IsString()
  nodeName?: string;

  /**
   * 任务类型枚举
   */
  @IsOptional()
  @IsEnum(VsNodeTaskTypeEnum)
  taskType?: VsNodeTaskTypeEnum;

  /**
   * 用户日志字符串内容
   */
  @IsOptional()
  @IsString()
  userLogStr?: string;

  /**
   * 请求时间
   * 格式：yyyy-MM-dd HH:mm:ss，时区：GMT+8
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // 解析 yyyy-MM-dd HH:mm:ss 格式的字符串
      const date = new Date(value.replace(' ', 'T') + '+08:00');
      return isNaN(date.getTime()) ? undefined : date;
    }
    return value instanceof Date ? value : undefined;
  })
  requestTime?: Date;

  /**
   * 创建时间
   * 格式：yyyy-MM-dd HH:mm:ss，时区：GMT+8
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // 解析 yyyy-MM-dd HH:mm:ss 格式的字符串
      const date = new Date(value.replace(' ', 'T') + '+08:00');
      return isNaN(date.getTime()) ? undefined : date;
    }
    return value instanceof Date ? value : undefined;
  })
  createTime?: Date;

  /**
   * 默认构造函数
   */
  constructor() {}

  /**
   * 带参数的构造函数
   * @param id 日志ID
   * @param msgId 消息ID
   * @param nodeId 节点ID
   * @param nodeName 节点名称
   * @param taskType 任务类型
   * @param userLogStr 用户日志内容
   * @param requestTime 请求时间
   * @param createTime 创建时间
   */
  static create(
    id?: string,
    msgId?: string,
    nodeId?: string,
    nodeName?: string,
    taskType?: VsNodeTaskTypeEnum,
    userLogStr?: string,
    requestTime?: Date,
    createTime?: Date
  ): VsNodeUserLogSaveReq {
    const req = new VsNodeUserLogSaveReq();
    req.id = id;
    req.msgId = msgId;
    req.nodeId = nodeId;
    req.nodeName = nodeName;
    req.taskType = taskType;
    req.userLogStr = userLogStr;
    req.requestTime = requestTime;
    req.createTime = createTime;
    return req;
  }

  /**
   * 转换为VsNodeUserLog实体对象
   * 对应Java版本的toVsNodeUserLog()方法
   * @returns VsNodeUserLog实体对象
   */
  public toVsNodeUserLog() {
    // const log = new VsNodeUserLog();
    // log.id = this.id;
    // log.msgId = this.msgId;
    // log.nodeId = this.nodeId;
    // log.nodeName = this.nodeName;
    // log.taskType = this.taskType;
    // log.userLogStr = this.userLogStr;
    // log.requestTime = this.requestTime;
    // log.createTime = this.createTime;
    // return log;
  }

  /**
   * 格式化日期为字符串
   * @param date 日期对象
   * @returns 格式化后的日期字符串 (yyyy-MM-dd HH:mm:ss)
   */
  private formatDate(date: Date): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 获取格式化的请求时间字符串
   * @returns 格式化后的请求时间字符串
   */
  public getFormattedRequestTime(): string {
    return this.formatDate(this.requestTime);
  }

  /**
   * 获取格式化的创建时间字符串
   * @returns 格式化后的创建时间字符串
   */
  public getFormattedCreateTime(): string {
    return this.formatDate(this.createTime);
  }

  /**
   * 转换为JSON对象，用于序列化
   * @returns JSON对象
   */
  public toJSON(): any {
    return {
      id: this.id,
      msgId: this.msgId,
      nodeId: this.nodeId,
      nodeName: this.nodeName,
      taskType: this.taskType,
      userLogStr: this.userLogStr,
      requestTime: this.getFormattedRequestTime(),
      createTime: this.getFormattedCreateTime()
    };
  }

  /**
   * 从JSON对象创建实例
   * @param json JSON对象
   * @returns VsNodeUserLogSaveReq实例
   */
  public static fromJSON(json: any): VsNodeUserLogSaveReq {
    const req = new VsNodeUserLogSaveReq();
    req.id = json.id;
    req.msgId = json.msgId;
    req.nodeId = json.nodeId;
    req.nodeName = json.nodeName;
    req.taskType = json.taskType;
    req.userLogStr = json.userLogStr;

    // 解析日期字符串
    if (json.requestTime) {
      req.requestTime = new Date(json.requestTime.replace(' ', 'T') + '+08:00');
    }
    if (json.createTime) {
      req.createTime = new Date(json.createTime.replace(' ', 'T') + '+08:00');
    }

    return req;
  }

  /**
   * 重写toString方法
   * @returns 对象的字符串表示
   */
  public toString(): string {
    return `VsNodeUserLogSaveReq{id='${this.id}', msgId='${this.msgId}', nodeId='${this.nodeId}', nodeName='${this.nodeName}', taskType=${this.taskType}, userLogStr='${this.userLogStr}', requestTime='${this.getFormattedRequestTime()}', createTime='${this.getFormattedCreateTime()}'}`;
  }
}