import {
  IsString,
  IsInt,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  Length,
  Min,
  Max,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

// 假设这些枚举已经定义
export enum VsHttpMethodEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export class PathParam {
  // @ApiProperty({ description: '路径参数名' })
  @IsNotEmpty({ message: '路径参数名不能为空' })
  @IsString()
  @Length(1, 64, { message: '路径参数名长度为1到64' })
  name: string;

  // @ApiPropertyOptional({
  //   description: '路径参数默认值,不传为空字符串',
  //   default: '',
  // })
  @IsOptional()
  @IsString()
  defaultValue: string = '';
}

/**
 * used for FULL add/update/query
 * http组件
 */
export class VsPortPropHttp {
  // @ApiProperty({ description: 'HTTP组件的接口ID' })
  @IsNotEmpty({ message: '接口ID不能为空' })
  @IsInt()
  httpCompApiId: number;

  // @ApiPropertyOptional({ description: '路径参数信息', type: [PathParam] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PathParam)
  pathParams?: PathParam[];

  // @ApiPropertyOptional({ description: '请求方式', enum: VsHttpMethodEnum })
  @IsOptional()
  @IsEnum(VsHttpMethodEnum)
  method?: VsHttpMethodEnum;

  // @ApiPropertyOptional({ description: 'URL' })
  @IsOptional()
  @IsString()
  url?: string;

  // @ApiPropertyOptional({ description: '请求超时时间,单位秒', default: 120 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: '请求超时时间最小值为1秒' })
  @Max(120, { message: '请求超时时间最大值为120秒' })
  requestTimeout: number = 120;

  // @ApiProperty({ description: '熔断器滑动窗口大小,默认100', default: 100 })
  @IsNotEmpty({ message: '熔断器滑动窗口大小不能为空' })
  @IsInt()
  @Min(1, { message: '熔断器滑动窗口最小值为1' })
  @Max(100, { message: '熔断器滑动窗口最大值为100' })
  slidingWindowSize: number = 100;

  // @ApiProperty({
  //   description: '熔断器开始计算的最小调用次数,默认10次',
  //   default: 50,
  // })
  @IsNotEmpty({ message: '熔断器开始计算的最小调用次数不能为空' })
  @IsInt()
  @Min(1, { message: '熔断器开始计算的调用次数最小值为1' })
  @Max(50, { message: '熔断器开始计算的调用次数最大值为50' })
  minimumNumberOfCalls: number = 50;

  // @ApiProperty({ description: '熔断器触发阈值比例,默认20%', default: 20 })
  @IsNotEmpty({ message: '熔断器触发阈值比例不能为空' })
  @IsInt()
  @Min(1, { message: '熔断器触发阈值比例最小值为1' })
  @Max(100, { message: '熔断器触发阈值比例最大值为100' })
  failureRateThreshold: number = 20;

  // @ApiPropertyOptional({
  //   description: '熔断器打开的时间(单位:秒),默认60秒',
  //   default: 60,
  // })
  @IsOptional()
  @IsInt()
  @Min(30, { message: '熔断器打开的时间最小值为30' })
  @Max(1800, { message: '熔断器打开的时间最大值为1800' })
  keepOpenStateInSeconds: number = 60;

  // @ApiProperty({
  //   description: '熔断器半开条件下允许调用的次数,默认10',
  //   default: 10,
  // })
  @IsNotEmpty({ message: '熔断器半开条件下允许调用的次数不能为空' })
  @IsInt()
  @Min(1, { message: '熔断器半开条件下允许调用的次数最小值为1' })
  @Max(100, { message: '熔断器半开条件下允许调用的次数最大值为100' })
  permittedNumberOfCallsInHalfOpenState: number = 10;
}
