import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ProjectPageQueryReqDTO } from './dto/project-pageQuery-req.dto';
import { PrismaService } from '@app/prisma';
import { Prisma } from '@prisma/client';
import { ProjectStateEnum } from '@app/enum/project.enum';
import { Page } from '@app/dto/page.dto';
import { ProjectAddReqDto } from './dto/add-project-req.dto';
import { ProjectQueryReqDTO } from './dto/project-query-req.dto';
import { ProjectUpdateReqDtoDto } from './dto/update-project.dto';
import { NodeService } from '../node/node.service';

@Injectable()
export class ProjectService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  @Inject(NodeService)
  private readonly nodeService: NodeService;
  async pageQuery(req: ProjectPageQueryReqDTO) {
    const { current, size, name } = req;
    // 构建查询条件
    const where: Prisma.t_vs_projectWhereInput = {};
    if (name) {
      where.name = {
        contains: name.trim(),
        // mode: Prisma.QueryMode.insensitive, // 使用正确的枚举类型
      };
    }
    // 执行查询
    const [total, records] = await Promise.all([
      // 获取总数
      this.prismaService.t_vs_project.count({ where }),
      // 获取分页数据
      this.prismaService.t_vs_project.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        skip: (current - 1) * size,
        take: size,
      }),
    ]);
    const respRecords = records.map((record) => ({
      id: record.id,
      name: record.name,
      state: record.state as ProjectStateEnum,
      description: record.description,
      compileVersion: record.compileVersion,
      properties: record.properties,
      createTime: record.createTime,
      modifyTime: record.modifyTime,
    }));
    // 返回分页结果
    return new Page(current, size, total, respRecords);
  }

  async add(projectAddReqDto: ProjectAddReqDto) {
    const { name, description } = projectAddReqDto;
    const projectExistList = await this.prismaService.t_vs_project.findMany({
      where: {
        name,
      },
    });
    if (projectExistList.length > 0) {
      throw new UnauthorizedException('项目名称已存在');
    }
    const result = await this.prismaService.t_vs_project.create({
      data: {
        name,
        description,
        // - Java中的 VsProject toVsProject() 方法在NestJS中直接在service层处理
        state: ProjectStateEnum.OFFLINE,
        properties: JSON.stringify({
          compileResult: null,
        }),
      },
    });
    return result;
  }

  async queryByCondition(req: ProjectQueryReqDTO) {
    const { id, name, contextPath, method } = req;
    const where: Prisma.t_vs_projectWhereInput = {};
    if (id) {
      where.id = id;
    }
    if (name) {
      where.name = {
        contains: name.trim(),
      };
    }
    if (contextPath) {
      where.contextPath = {
        contains: contextPath.trim(),
      };
    }
    if (method) {
      where.method = {
        contains: method.trim(),
      };
    }
    const list = await this.prismaService.t_vs_project.findMany({
      where,
    });
    return list;
  }

  async modify(projectModifyDto: ProjectUpdateReqDtoDto) {
    await this.prismaService.t_vs_project.update({
      where: {
        id: projectModifyDto.id,
      },
      data: {
        name: projectModifyDto.name,
        description: projectModifyDto.description,
      },
    });
    return true;
  }

  async layerLoad(req: { id: string }) {
    const { id } = req;
    const project = await this.prismaService.t_vs_project.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    return  await this.nodeService.list(project.id);
  }
}
