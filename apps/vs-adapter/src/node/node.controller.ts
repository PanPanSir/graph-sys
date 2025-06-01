import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NodeService } from './node.service';
import { AddNodeDto } from './dto/add-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Controller('/ip/vsNode')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  // @Get('id')
  // async detailQuery(@Query('id') id: string) {
  //   return this.nodeService.detailQuery(id);
  // }

  @Post('add')
  async add(@Body() dto: AddNodeDto) {
    await this.nodeService.add(dto);
    return "success"
  }

  // @Get('id')
  // async delete(@Query('id') id: string) {
  //   return this.nodeService.delete(id);
  // }

  @Post('update')
  async update(@Body() node: UpdateNodeDto) {
    return await this.nodeService.update(node);
  }
}
