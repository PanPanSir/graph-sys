import { IsNotEmpty, IsNumber } from 'class-validator';

export class ProjectLayerLoadReqDTO {
  @IsNotEmpty({ message: 'projectId不能为空' })
  @IsNumber({}, { message: '项目ID必须是数字' })
  projectId: number;
}
