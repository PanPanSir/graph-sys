import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { VsAdapterService } from './vs-adapter.service';
import { Response } from 'express';

@Controller('vsAdapter')
export class VsAdapterController {
  constructor(private readonly vsAdapterService: VsAdapterService) {}

  @Post('/**')
  async handlePost(
    @Req() request,
    @Body() body: any,
    @Headers() headers,
    @Query() query,
    @Res() response: Response,
  ) {
    const result = await this.vsAdapterService.processRequest({
      contextPath: request.path,
      method: 'POST',
      body,
      headers,
      query,
    });

    // 设置响应头
    Object.entries(result.headers).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    return response.json(result.body);
  }

  @Get('/**')
  async handleGet(
    @Req() request,
    @Headers() headers,
    @Query() query,
    @Res() response: Response,
  ) {
    const result = await this.vsAdapterService.processRequest({
      contextPath: request.path,
      method: 'GET',
      headers,
      query,
    });

    // 设置响应头
    Object.entries(result.headers).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    return response.json(result.body);
  }
}
