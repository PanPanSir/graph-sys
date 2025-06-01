import { Controller } from '@nestjs/common';
import { PortService } from './port.service';

@Controller('/ip/vsPort')
export class PortController {
  constructor(private readonly portService: PortService) {}
}
