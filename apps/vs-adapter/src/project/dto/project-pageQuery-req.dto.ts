import { IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { ProjectStateEnum } from '../../common/enums/project.enum';
import { Transform } from 'class-transformer';
import { ProjectPropDto } from './project-prop.dto';

export class ProjectPageQueryReqDTO {
  @IsNumber()
  @IsInt() // 确保是整数
  @Transform(({ value }) => BigInt(value)) // 转换为 BigInt 类型
  id: bigint; // 使用 bigint 类型来对应 Java 的 long

  @IsNotEmpty()
  name: string;

  @IsEnum(ProjectStateEnum)
  state: ProjectStateEnum;

  description: string;

  properties: ProjectPropDto;
}
