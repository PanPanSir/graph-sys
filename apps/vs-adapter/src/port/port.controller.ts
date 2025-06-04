import { Body, Controller, Post } from '@nestjs/common';
import { PortService } from './port.service';
import { AddPortDto } from './dto/add-port.dto';

@Controller('/ip/vsPort')
export class PortController {
  constructor(private readonly portService: PortService) {}

  @Post('add')
  async add(@Body() req: AddPortDto) {
    await this.portService.add(req);
    return 'success';
  }
}
