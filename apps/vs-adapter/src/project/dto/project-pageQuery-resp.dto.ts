import { VsProjectStateEnum } from '@app/enum//project.enum';
import { VsProject } from '../entities/project.entity';
import { ProjectPropDto } from './project-prop.dto';

export class VsProjectPageQueryRespDto {
  id: number;

  name: string;

  description: string;

  state: VsProjectStateEnum;

  properties: ProjectPropDto;
  constructor(vsProject: VsProject) {
    this.id = vsProject.id;
    this.name = vsProject.name;
    this.description = vsProject.description;
    this.state = vsProject.state as VsProjectStateEnum;

    // 如果属性为空，设置默认值
    if (!vsProject.properties) {
      this.properties = new ProjectPropDto();
    } else {
      // Prisma会自动处理JSON字段的序列化和反序列化
      this.properties = JSON.parse(vsProject.properties as unknown as string);
    }
  }
}
