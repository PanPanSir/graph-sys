import { IsInt, IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProjectPageQueryReqDTO {
  @Min(1, { message: '当前页必须大于0' }) // 最小值为1
  @Transform(({ value }) => Number(value)) // 将值转换为数字
  @IsInt({ message: '当前页必须是整数' })
  @IsNotEmpty({ message: '当前页不能为空' })
  current: number;

  @Min(1, { message: '页大小必须大于0' }) // 最小值为1
  @IsInt({ message: '页大小必须是整数' })
  @Transform(({ value }) => Number(value)) // 将值转换为数字
  @IsNotEmpty({ message: '页大小不能为空' })
  size: number;

  @MaxLength(64, { message: '名字搜索最长长度为64' })
  @IsOptional()
  name?: string;
}
