import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NodeService } from './node.service';
import { AddNodeDto } from './dto/add-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Controller('vs/node')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Get('id')
  async detailQuery(@Query('id') id: string) {
    return this.nodeService.detailQuery(id);
  }

  @Post()
  async add(@Body() dto: AddNodeDto) {
    return this.nodeService.add(dto);
  }

  @Get('id')
  async delete(@Query('id') id: string) {
    return this.nodeService.delete(id);
  }

  @Post('update')
  async update(@Body() node: UpdateNodeDto) {
    return this.nodeService.update(id, node);
  }
}
