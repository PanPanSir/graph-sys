import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VsNodeTaskType, VsNodeViewType } from '../../common/enums/node.enum';
import { AddPortDto } from '../../port/dto/add-port.dto';
import { NodePropertiesDto } from './node-properties.dto';

export class AddNodeDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  projectId: number;

  @IsEnum(VsNodeTaskType)
  taskType: VsNodeTaskType;

  @IsEnum(VsNodeViewType)
  viewType: VsNodeViewType;

  @IsString()
  upLevelNodeId: string;

  @IsString()
  script: string;

  @IsString()
  classBytes: string;

  @IsNotEmpty({
    message: 'properties 不能为空',
  })
  @ValidateNested() // 告诉验证器需要递归验证 properties 属性中的嵌套对象
  @Type(() => NodePropertiesDto)
  properties: NodePropertiesDto;

  @IsArray()
  @ValidateNested({ each: true }) // 参数表示如果是数组，需要验证数组中的每个元素
  @Type(() => AddPortDto)
  ports: AddPortDto[];
}
