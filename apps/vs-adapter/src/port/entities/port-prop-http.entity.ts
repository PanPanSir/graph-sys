import { VsHttpMethodEnum } from '@app/enum//port.enum';

export class VsPortPropHttp {
  // @ApiProperty({ description: 'HTTP组件的接口ID' })
  // @Column('bigint')
  // @IsNotEmpty({ message: '接口ID不能为空' })
  // httpCompApiId: number;

  // @ApiProperty({ description: '路径参数信息' })
  // @Column('json')
  // @ValidateNested({ each: true })
  pathParams?: PathParam[];

  // @ApiProperty({ description: '请求方式' })
  // @Column('enum', { enum: VsHttpMethodEnum })
  method?: VsHttpMethodEnum;

  // @ApiProperty({ description: 'URL' })
  // @Column('varchar')
  url?: string;

  // @ApiProperty({ description: '请求超时时间,单位秒' })
  // @Column('int', { default: 120 })
  // @Min(1, { message: '请求超时时间最小值为1秒' })
  // @Max(120, { message: '请求超时时间最大值为120秒' })
  requestTimeout: number = 120;

  // @ApiProperty({ description: '熔断器滑动窗口大小,默认100' })
  // @Column('int', { default: 100 })
  // @IsNotEmpty({ message: '熔断器滑动窗口大小不能为空' })
  // @Min(1, { message: '熔断器滑动窗口最小值为1' })
  // @Max(100, { message: '熔断器滑动窗口最大值为100' })
  slidingWindowSize: number = 100;

  // @ApiProperty({ description: '熔断器开始计算的最小调用次数,默认10次' })
  // @Column('int', { default: 50 })
  // @IsNotEmpty({ message: '熔断器开始计算的最小调用次数不能为空' })
  // @Min(1, { message: '熔断器开始计算的调用次数最小值为1' })
  // @Max(50, { message: '熔断器开始计算的调用次数最大值为50' })
  minimumNumberOfCalls: number = 50;

  // @ApiProperty({ description: '熔断器触发阈值比例,默认20%' })
  // @Column('int', { default: 20 })
  // @IsNotEmpty({ message: '熔断器触发阈值比例不能为空' })
  // @Min(1, { message: '熔断器触发阈值比例最小值为1' })
  // @Max(100, { message: '熔断器触发阈值比例最大值为100' })
  failureRateThreshold: number = 20;

  // @ApiProperty({ description: '熔断器打开的时间(单位:秒),默认60秒' })
  // @Column('int', { default: 60 })
  // @Min(30, { message: '熔断器打开的时间最小值为30' })
  // @Max(1800, { message: '熔断器打开的时间最大值为1800' })
  keepOpenStateInSeconds: number = 60;

  // @ApiProperty({ description: '熔断器半开条件下允许调用的次数,默认10' })
  // @Column('int', { default: 10 })
  // @IsNotEmpty({ message: '熔断器半开条件下允许调用的次数不能为空' })
  // @Min(1, { message: '熔断器半开条件下允许调用的次数最小值为1' })
  // @Max(100, { message: '熔断器半开条件下允许调用的次数最大值为100' })
  permittedNumberOfCallsInHalfOpenState: number = 10;
}

export class PathParam {
  // @ApiProperty({ description: '路径参数名' })
  // @Column('varchar', { length: 64 })
  // @IsNotEmpty({ message: '路径参数名不能为空' })
  name: string;

  // @ApiProperty({ description: '路径参数默认值,不传为空字符串' })
  // @Column('varchar', { default: '' })
  defaultValue: string = '';
}
