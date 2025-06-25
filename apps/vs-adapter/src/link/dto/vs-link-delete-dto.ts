import { IsNotEmpty, IsString } from 'class-validator';

export class VsLinkDeleteReq {
  @IsNotEmpty({
    message: '连线id不能为空',
  })
  @IsString({
    message: '连线id必须为字符串',
  })
  id: string;
}
