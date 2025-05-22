import { ProjectStateEnum } from '../../common/enums/project.enum';
import { Project } from '../entities/project.entity';
import { ProjectPropDto } from './project-prop.dto';

export class VsProjectPageQueryRespDto {
  id: number;

  name: string;

  description: string;

  state: ProjectStateEnum;

  properties: ProjectPropDto;
  constructor(vsProject: Project) {
    this.id = vsProject.id;
    this.name = vsProject.name;
    this.description = vsProject.description;
    this.state = vsProject.state as ProjectStateEnum;

    // 如果属性为空，设置默认值
    if (!vsProject.properties) {
      this.properties = new ProjectPropDto();
    } else {
      // Prisma会自动处理JSON字段的序列化和反序列化
      this.properties = JSON.parse(vsProject.properties as unknown as string);
    }
  }
}
