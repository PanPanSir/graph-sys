import { PartialType } from '@nestjs/mapped-types';
import { CreateVsAdapterDto } from './create-vs-adapter.dto';

export class UpdateVsAdapterDto extends PartialType(CreateVsAdapterDto) {}
