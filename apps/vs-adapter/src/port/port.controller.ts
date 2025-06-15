import { Body, Controller, Post } from '@nestjs/common';
import { PortService } from './port.service';
import { AddPortDto } from './dto/add-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';


@Controller('/ip/vsPort')
export class PortController {
  constructor(private readonly portService: PortService) {}

  @Post('add')
  async add(@Body() req: AddPortDto) {
    await this.portService.add(req);
    return 'success';
  }

  @Post('detailQuery')
  async detailQuery(@Body() req: AddPortDto) {
    await this.portService.detailQuery(req);
    return 'success';
  }

  @Post('update')
  async update(@Body() req: UpdatePortDto) {
    await this.portService.modify(req);
    return 'success';
  }
}
