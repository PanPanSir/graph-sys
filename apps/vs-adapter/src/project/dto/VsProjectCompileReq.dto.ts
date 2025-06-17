import { IsNotEmpty, IsNumber } from 'class-validator';

export class VsProjectCompileReq {
  // @ApiProperty({ description: '项目ID' })
  @IsNotEmpty({ message: '项目ID不能为空' })
  @IsNumber({}, { message: '项目ID必须是数字' })
  id: number;
}
