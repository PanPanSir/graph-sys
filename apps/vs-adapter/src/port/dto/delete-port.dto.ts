import { IsString, IsNotEmpty } from 'class-validator';

export class DeletePortDto {
  @IsNotEmpty({
    message: '端口id不能为空',
  })
  @IsString({
    message: '端口id类型错误',
  })
  id: string;
}
