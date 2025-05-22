import { PartialType } from '@nestjs/mapped-types';
import { ProjectAddReqDto } from './add-project-req.dto';
import { IsNotEmpty } from 'class-validator';

export class ProjectUpdateReqDtoDto extends PartialType(ProjectAddReqDto) {
  @IsNotEmpty({ message: 'id不能为空' })
  id: number;
}
