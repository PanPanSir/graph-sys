import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { VsNodeTaskTypeEnum } from '@app/enum/node.enum';

class VsNodeUserLog {
  id?: string;
  msgId?: string;
  nodeId?: string;
  nodeName?: string;
  taskType?: VsNodeTaskTypeEnum;
  userLogStr?: string;
  requestTime?: Date;
  createTime?: Date;
}
/**
 * 图形化引擎的请求用户日志,存储于ES中
 */
export class VsNodeUserLogSaveReqDto {
  // @@ApiProperty({ description: 'ID', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  // @@ApiProperty({ description: '消息ID', required: false })
  @IsOptional()
  @IsString()
  msgId?: string;

  // @@ApiProperty({ description: '节点ID', required: false })
  @IsOptional()
  @IsString()
  nodeId?: string;

  // @@ApiProperty({ description: '节点名称', required: false })
  @IsOptional()
  @IsString()
  nodeName?: string;

  // @@ApiProperty({
  //   description: '任务类型',
  //   enum: VsNodeTaskTypeEnum,
  //   required: false
  // })
  @IsOptional()
  @IsEnum(VsNodeTaskTypeEnum)
  taskType?: VsNodeTaskTypeEnum;

  // @@ApiProperty({ description: '用户日志字符串', required: false })
  @IsOptional()
  @IsString()
  userLogStr?: string;

  // @@ApiProperty({
  //   description: '请求时间',
  //   type: 'string',
  //   format: 'date-time',
  //   example: '2023-12-01 10:30:00',
  //   required: false
  // })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  @Type(() => Date)
  requestTime?: Date;

  // @@ApiProperty({
  //   description: '创建时间',
  //   type: 'string',
  //   format: 'date-time',
  //   example: '2023-12-01 10:30:00',
  //   required: false
  // })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  @Type(() => Date)
  createTime?: Date;

  /**
   * 转换为VsNodeUserLog实体
   */
  toVsNodeUserLog(): VsNodeUserLog {
    const log = new VsNodeUserLog();
    log.id = this.id;
    log.msgId = this.msgId;
    log.nodeId = this.nodeId;
    log.nodeName = this.nodeName;
    log.taskType = this.taskType;
    log.userLogStr = this.userLogStr;
    log.requestTime = this.requestTime;
    log.createTime = this.createTime;
    return log;
  }
}
