import { Controller } from '@nestjs/common';
import { VsAdapterService } from './vs-adapter.service';

@Controller('vsAdapter')
export class VsAdapterController {
  constructor(private readonly vsAdapterService: VsAdapterService) {}
}
