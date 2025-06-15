import { IsNotEmpty, IsString } from 'class-validator';

export class VsPortDetailQueryReq {
	@IsString({ message: '端口ID必须为字符串' })
  @IsNotEmpty({ message: '端口ID不能为空' })
  id: string;
}