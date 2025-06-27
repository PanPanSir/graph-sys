import { Controller, Post, Body } from '@nestjs/common';
import { NodeService } from './node.service';
import { AddNodeDto } from './dto/add-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { ResultInfo } from '@app/dto/result.dto';

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
    return new ResultInfo('success');
  }

  // @Get('id')
  // async delete(@Query('id') id: string) {
  //   return this.nodeService.delete(id);
  // }

  @Post('update')
  async update(@Body() node: UpdateNodeDto) {
    const data = await this.nodeService.update(node);
    return new ResultInfo(data);
  }
}
