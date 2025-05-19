import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PortService } from './port.service';
import { CreatePortDto } from './dto/add-port.dto';
import { UpdatePortDto } from './dto/update-port1.dto';

@Controller('port')
export class PortController {
  constructor(private readonly portService: PortService) {}

  @Post()
  create(@Body() createPortDto: CreatePortDto) {
    return this.portService.create(createPortDto);
  }

  @Get()
  findAll() {
    return this.portService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortDto: UpdatePortDto) {
    return this.portService.update(+id, updatePortDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portService.remove(+id);
  }
}
