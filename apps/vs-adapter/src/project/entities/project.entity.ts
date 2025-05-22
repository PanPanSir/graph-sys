import { ProjectStateEnum } from '../../common/enums/project.enum';

export class Project {
  @ApiProperty({ description: '项目ID' })
  @IsNumber()
  @IsNotEmpty({ message: '项目ID不能为空' })
  id: number;

  @ApiProperty({ description: '项目名称' })
  @IsNotEmpty({ message: '项目名称不能为空' })
  @MaxLength(64, { message: '项目名称最大长度为64' })
  name: string;

  @ApiProperty({ description: '项目描述', required: false })
  @IsOptional()
  @MaxLength(255, { message: '项目描述最大长度为255' })
  description: string;

  @ApiProperty({ description: '上下文路径', required: false })
  @IsOptional()
  @MaxLength(600, { message: '上下文路径最大长度为600' })
  contextPath: string;

  @ApiProperty({ description: '编译版本' })
  @IsNumber()
  @IsNotEmpty({ message: '编译版本不能为空' })
  compileVersion: number;

  @ApiProperty({ description: '方法', required: false })
  @IsOptional()
  @MaxLength(8, { message: '方法最大长度为8' })
  method: string;

  @ApiProperty({ description: '属性', required: false })
  @IsOptional()
  properties: any;

  @ApiProperty({ description: '状态', enum: ProjectStateEnum })
  @IsNotEmpty({ message: '状态不能为空' })
  state: ProjectStateEnum;

  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @ApiProperty({ description: '修改时间' })
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
