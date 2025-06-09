import { IsNumber, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ProjectStateEnum } from '@app/enum//project.enum';

export class Project {
  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  id: number;

  @IsNotEmpty({ message: '项目名称不能为空' })
  @MaxLength(64, { message: '项目名称最大长度为64' })
  name: string;

  @IsOptional()
  @MaxLength(255, { message: '项目描述最大长度为255' })
  description: string;

  @IsOptional()
  @MaxLength(600, { message: '上下文路径最大长度为600' })
  contextPath: string;

  @IsNumber()
  @IsNotEmpty({ message: '编译版本不能为空' })
  compileVersion: number;

  @IsOptional()
  @MaxLength(8, { message: '方法最大长度为8' })
  method: string;

  @IsOptional()
  properties: any;

  @IsNotEmpty({ message: '状态不能为空' })
  state: ProjectStateEnum;

  createTime: Date;

  modifyTime: Date;

  static fromPrisma(prismaProject: any): Project {
    const project = new Project();
    project.id = prismaProject.id;
    project.name = prismaProject.name;
    project.description = prismaProject.description;
    project.contextPath = prismaProject.context_path;
    project.compileVersion = prismaProject.compile_version;
    project.method = prismaProject.method;
    project.properties = prismaProject.properties;
    project.state = prismaProject.state as ProjectStateEnum;
    project.createTime = prismaProject.create_time;
    project.modifyTime = prismaProject.modify_time;
    return project;
  }
}
