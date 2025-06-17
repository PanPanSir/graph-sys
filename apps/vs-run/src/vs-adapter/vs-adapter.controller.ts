import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VsAdapterService } from './vs-adapter.service';
import { CreateVsAdapterDto } from './dto/create-vs-adapter.dto';
import { UpdateVsAdapterDto } from './dto/update-vs-adapter.dto';

@Controller('vs-adapter')
export class VsAdapterController {
  constructor(private readonly vsAdapterService: VsAdapterService) {}

  @Post()
  create(@Body() createVsAdapterDto: CreateVsAdapterDto) {
    return this.vsAdapterService.create(createVsAdapterDto);
  }

  @Get()
  findAll() {
    return this.vsAdapterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vsAdapterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVsAdapterDto: UpdateVsAdapterDto) {
    return this.vsAdapterService.update(+id, updateVsAdapterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vsAdapterService.remove(+id);
  }
}
