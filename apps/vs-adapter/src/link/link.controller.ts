import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { UpdateLinkDto } from './dto/update-link.dto';
import { VsLinkAddReq } from './dto/vs-link-add-req.dto';

@Controller('/ip/vsLink')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Post('/add')
  create(@Body() req: VsLinkAddReq) {
    if (req.sourceId === req.targetId) {
      throw new BadRequestException('连线异常：边不能出现在同一个节点上');
    }
    if (req.sourcePort === req.targetPort) {
      throw new BadRequestException('连线异常：边不能出现在同一个端口上');
    }
    return this.linkService.add(req);
  }

  @Get()
  findAll() {
    return this.linkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linkService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return this.linkService.update(+id, updateLinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.linkService.remove(+id);
  }
}
