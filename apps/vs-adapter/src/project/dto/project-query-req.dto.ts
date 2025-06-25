import { VsHttpMethodEnum } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ProjectQueryReqDTO {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  @Length(0, 64, { message: '名字搜索最长长度为64' })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 512, { message: '路径在1到512个字符之间' })
  contextPath?: string;

  @IsOptional()
  @IsEnum(VsHttpMethodEnum)
  method?: VsHttpMethodEnum;
}
