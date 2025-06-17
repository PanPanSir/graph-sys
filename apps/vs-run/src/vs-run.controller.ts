import { Controller, Get } from '@nestjs/common';
import { VsRunService } from './vs-run.service';

@Controller()
export class VsRunController {
  constructor(private readonly vsRunService: VsRunService) {}

  @Get()
  getHello(): string {
    return this.vsRunService.getHello();
  }
}
