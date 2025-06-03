import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsOptional,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  VsNodeTaskTypeEnum,
  VsNodeViewTypeEnum,
} from '../../common/enums/node.enum';
import { VsPortTypeEnum } from '../../common/enums/port.enum';
import { NodePropertiesDto } from './node-properties.dto';
import { VsPortProp } from '../../port/entities/port.prop.entity';

// 先定义Port类，而不是作为静态内部类
export class PortDto {
  @IsNotEmpty({
    message: '端口ID不能为空',
  })
  @IsString()
  @Length(1, 64, { message: '端口ID在1到64个字符之间' })
  id: string;

  @IsEnum(VsPortTypeEnum)
  @IsNotEmpty({
    message: '端口类型不能为空',
  })
  type: VsPortTypeEnum;

  @IsNotEmpty({
    message: '属性不能为空',
  })
  @ValidateNested()
  @Type(() => VsPortProp)
  properties: VsPortProp;

  // 转换方法，接收父类的projectId和nodeId
  toVsPort(projectId: number, nodeId: string) {
    return {
      id: this.id,
      projectId: projectId,
      nodeId: nodeId,
      type: this.type,
      properties: this.properties,
    };
  }
}

export class AddNodeDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => Number(value))
  projectId: number;

  @IsEnum(VsNodeTaskTypeEnum)
  taskType: VsNodeTaskTypeEnum;

  @IsEnum(VsNodeViewTypeEnum)
  viewType: VsNodeViewTypeEnum;

  @IsString()
  @Transform(({ value }) => value.toString() || '')
  upLevelNodeId: string;

  @IsString()
  @IsOptional()
  script?: string;

  @IsString()
  @IsOptional()
  classBytes?: string;

  @IsNotEmpty({
    message: 'properties 不能为空',
  })
  @ValidateNested() // 告诉验证器需要递归验证 properties 属性中的嵌套对象
  @Type(() => NodePropertiesDto)
  properties: NodePropertiesDto;

  @IsArray()
  @ValidateNested({ each: true }) // 参数表示如果是数组，需要验证数组中的每个元素
  @Type(() => PortDto)
  ports: PortDto[];

  // 可以添加一个转换方法，类似于Java中的toVsNode方法
  toVsNode() {
    // 实现转换逻辑
    return {
      id: this.id,
      projectId: this.projectId,
      taskType: this.taskType,
      viewType: this.viewType,
      upLevelNodeId: this.upLevelNodeId,
      properties: this.properties,
    };
  }
}
