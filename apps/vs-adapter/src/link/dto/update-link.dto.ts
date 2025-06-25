import { PartialType } from '@nestjs/mapped-types';
import { CreateLinkDto } from './vs-link-add-req.dto';

export class UpdateLinkDto extends PartialType(CreateLinkDto) {}
