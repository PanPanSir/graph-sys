import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { LinkService } from './link.service';
import { VsLinkAddReq } from './dto/vs-link-add-req.dto';
import { VsLinkDeleteReq } from './dto/vs-link-delete-dto';

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

  @Post('/delete')
  delete(@Body() req: VsLinkDeleteReq) {
    return this.linkService.delete(req);
  }
}
