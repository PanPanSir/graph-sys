import { Body, Controller, Post } from '@nestjs/common';
import { PortService } from './port.service';
import { AddPortDto } from './dto/add-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';
import { DeletePortDto } from './dto/delete-port.dto';
import { ResultInfo } from '@app/dto/result.dto';

@Controller('/ip/vsPort')
export class PortController {
  constructor(private readonly portService: PortService) {}

  @Post('add')
  async add(@Body() req: AddPortDto) {
    await this.portService.add(req);
    return new ResultInfo('success');
  }

  @Post('detailQuery')
  async detailQuery(@Body() req: AddPortDto) {
    await this.portService.detailQuery(req);
    return new ResultInfo('success');
  }

  @Post('update')
  async update(@Body() req: UpdatePortDto) {
    await this.portService.modify(req);
    return new ResultInfo('success');
  }

  @Post('delete')
  async delete(@Body() req: DeletePortDto) {
    await this.portService.delete(req.id);
    return new ResultInfo('success');
  }
}
