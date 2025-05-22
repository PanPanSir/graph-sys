import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectPageQueryReqDTO } from './dto/project-pageQuery-req.dto';
import { ResultInfo } from '@app/dto/result.dto';
import { ProjectAddReqDto } from './dto/add-project-req.dto';
import { ProjectQueryReqDTO } from './dto/project-query-req.dto';
import { ProjectUpdateReqDtoDto } from './dto/update-project.dto';
import { ProjectLayerLoadReqDTO } from './dto/project-layerLoad-req.dto';

@Controller('ip/vsProject')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('pageQuery')
  async pageQuery(@Body(ValidationPipe) req: ProjectPageQueryReqDTO) {
    const result = await this.projectService.pageQuery(req);
    return new ResultInfo(result);
  }

  @Post('query')
  async query(@Body(ValidationPipe) req: ProjectQueryReqDTO) {
    const result = await this.projectService.queryByCondition(req);
    return new ResultInfo(result);
  }

  @Post('add')
  async add(@Body(ValidationPipe) req: ProjectAddReqDto) {
    const result = await this.projectService.add(req);
    return new ResultInfo(result);
  }

  // @Post('delete')
  // async delete(@Body(ValidationPipe) id: number) {
  //   const result = await this.projectService.delete(id);
  //   return new ResultInfo(result);
  // }

  @Post('update')
  async update(@Body(ValidationPipe) req: ProjectUpdateReqDtoDto) {
    const result = await this.projectService.modify(req);
    return new ResultInfo(result);
  }

  //   @Post('changeState')
  //   async changeState(@Body(ValidationPipe) req: ProjectChangeStateReq) {
  //     const result = await this.projectService.changeState(req);
  //     return new ResultInfo(result);
  //   }

  //   @Post('compile')
  //   async compile(@Body(ValidationPipe) req: ProjectCompileReq) {
  //     const addTaskSuccess = await this.projectService.compile(req);
  //     if (addTaskSuccess) {
  //       return new ResultInfo(true, '操作成功,等稍后刷新页面查看编译结果');
  //     } else {
  //       return new ResultInfo(false, '当前编译任务过多,等稍后重新提交');
  //     }
  //   }

  //   @Post('compileSync')
  //   async compileSync(@Body(ValidationPipe) req: ProjectCompileReq) {
  //     const result = await this.projectService.compileSync(req);
  //     return new ResultInfo(result);
  //   }

  //   @Post('tileLoad')
  //   async tileLoad(@Body(ValidationPipe) req: ProjectTileLoadReq) {
  //     const result = await this.projectService.tileLoad(req);
  //     return new ResultInfo(result);
  //   }

  @Post('layerLoad')
  async layerLoad(@Body(ValidationPipe) req: ProjectLayerLoadReqDTO) {
    const result = await this.projectService.layerLoad(req);
    return new ResultInfo(result);
  }
}
