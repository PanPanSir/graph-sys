import { PartialType } from '@nestjs/mapped-types';
import { ProjectAddReqDto } from './add-project-req.dto';

export class ProjectUpdateReqDtoDto extends PartialType(ProjectAddReqDto) {}
