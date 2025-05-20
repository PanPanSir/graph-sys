import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ProjectAddReqDto {
  @IsNotEmpty({ message: '项目名字不能为空' })
  @Length(1, 64, { message: '项目名字在1到64个字符之间' })
  @IsString()
  name: string;

  @Length(0, 200, { message: '项目描述长度在0到200个字符之间' })
  @IsString()
  description: string;
}
