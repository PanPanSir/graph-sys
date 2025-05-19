import { PartialType } from '@nestjs/mapped-types';
import { AddNodeDto } from './add-node.dto';

export class UpdateNodeDto extends PartialType(AddNodeDto) {}
