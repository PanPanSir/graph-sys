import { Controller } from '@nestjs/common';
import { PortService } from './port.service';

@Controller('port')
export class PortController {
  constructor(private readonly portService: PortService) {}
}
