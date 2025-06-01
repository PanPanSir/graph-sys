import { PartialType, PickType } from '@nestjs/mapped-types';
import { AddNodeDto } from './add-node.dto';

export class UpdateNodeDto extends PartialType(PickType(AddNodeDto, ['id', 'properties'])) {}