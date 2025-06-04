import {
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type, Exclude } from 'class-transformer';

// 假设这个枚举已经定义
export enum VsDataConvertFieldTypeEnum {}
// 根据实际情况定义枚举值

export class MappingGrid {
  @IsNotEmpty({ message: '字段名不能为空' })
  @IsString()
  @Length(1, 64, { message: '字段名长度为1到64' })
  fieldName: string;

  @IsNotEmpty({ message: '数据节点类型不能为空' })
  @IsEnum(VsDataConvertFieldTypeEnum)
  fieldType: VsDataConvertFieldTypeEnum;

  @IsOptional()
  @IsString()
  desc?: string;

  constructor(
    fieldName?: string,
    fieldType?: VsDataConvertFieldTypeEnum,
    desc?: string,
  ) {
    if (fieldName) this.fieldName = fieldName;
    if (fieldType) this.fieldType = fieldType;
    if (desc) this.desc = desc;
  }
}

/**
 * used for FULL add/update/query
 * 数据转换映射关系
 */
export class VsDataConvProp {
  // ----------------------  tree part, also as target data format definition ----------------------

  @IsNotEmpty({ message: '字段名不能为空' })
  @IsString()
  @Length(1, 64, { message: '字段名长度为1到64' })
  fieldName: string;

  @IsNotEmpty({ message: '数据节点类型不能为空' })
  @IsEnum(VsDataConvertFieldTypeEnum)
  fieldType: VsDataConvertFieldTypeEnum;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VsDataConvProp)
  children?: VsDataConvProp[];

  // ----------------------  tile part, also as source data format definition ----------------------
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingGrid)
  mappingGrids?: MappingGrid[];
  // ----------------------  tile part, also as source data format definition ----------------------

  // ----------------------  下面属性由后端自动生成，无需返回给前端 ----------------------
  @Exclude()
  id?: string;

  @Exclude()
  pid?: string;

  @Exclude()
  parent?: VsDataConvProp;

  @Exclude()
  shouldConvert?: boolean = false;

  @Exclude()
  javaVarName?: string;

  @Exclude()
  javaClassName?: string;

  @Exclude()
  javaVarType?: string;
  // ----------------------  tree part, also as target data format definition ----------------------

  constructor(fieldName?: string, fieldType?: VsDataConvertFieldTypeEnum) {
    if (fieldName) this.fieldName = fieldName;
    if (fieldType) this.fieldType = fieldType;
  }

  /**
   * add a child node to current node
   */
  addChild(child: VsDataConvProp): void {
    if (!child) {
      throw new Error('添加孩子节点的参数非法,不能传NULL');
    }
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
  }
}
