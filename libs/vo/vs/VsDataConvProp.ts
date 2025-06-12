import {
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type, Exclude } from 'class-transformer';
import { VsDataConvertFieldTypeEnum } from '@app/enum/VsDataConvertFieldTypeEnum';

/**
 * 数据转换映射关系
 * used for FULL add/update/query
 */
export class VsDataConvProp {
  // ----------------------  tree part, also as target data format definition ----------------------

  // @ApiProperty({ description: '字段名,代表了应该生成的JSON字段名字' })
  @IsNotEmpty({ message: '字段名不能为空' })
  @Length(1, 64, { message: '字段名长度为1到64' })
  fieldName: string;

  // @ApiProperty({ description: '当前数据节点在JSON中的类型,借鉴了JSON数据类型但不完全一样' })
  @IsNotEmpty({ message: '数据节点类型不能为空' })
  fieldType: VsDataConvertFieldTypeEnum;

  // @ApiProperty({ description: '字段描述' })
  @IsOptional()
  desc?: string;

  // // @ApiProperty({
  //   description: '子节点描述,仅当当前数据节点类型为OBJECT/ARRAY-OBJECT时生效',
  //   type: [VsDataConvProp]
  // })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VsDataConvProp)
  children?: VsDataConvProp[];

  // ----------------------  tile part, also as source data format definition ----------------------

  // // @ApiProperty({
  //   description: '对应行的单元格集合,只有叶子节点才会有对应的行单元格集合',
  //   type: [MappingGrid]
  // })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MappingGrid)
  mappingGrids?: MappingGrid[];

  // ----------------------  下面属性由后端自动生成 ----------------------

  // @ApiProperty({ description: 'ID,代表当前节点ID' })
  @Exclude()
  @IsOptional()
  id?: string;

  // @ApiProperty({ description: '父ID,代表了所属上一层的ID,-1表示当前节点就是根' })
  @Exclude()
  @IsOptional()
  pid?: string;

  // @ApiProperty({ description: '父节点,根节点父节点为NULL' })
  @Exclude()
  @IsOptional()
  parent?: VsDataConvProp;

  // @ApiProperty({ description: '目标叶子节点和源节点是否应该进行映射, 非叶子节点/无映射关系时此属性值则为False或者NULL' })
  @Exclude()
  @IsOptional()
  shouldConvert?: boolean = false;

  // @ApiProperty({ description: '当前数据在Java类中的变量名' })
  @Exclude()
  @IsOptional()
  javaVarName?: string;

  // @ApiProperty({ description: '类名,当字段类型为OBJECT或者ARRAY-OBJECT时才需要生成类名' })
  @Exclude()
  @IsOptional()
  javaClassName?: string;

  // @ApiProperty({ description: '当前数据节点在Java中的类型(字符串表示用于方便生成代码)' })
  @Exclude()
  @IsOptional()
  javaVarType?: string;

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

  toString(): string {
    return `VsDataConvProp{fieldName='${this.fieldName}', fieldType=${this.fieldType}}`;
  }
}

/**
 * tile part, as source data format definition
 */
export class MappingGrid {
  // // @ApiProperty({ description: '字段名,代表了应该生成的JSON字段名字' })
  @IsNotEmpty({ message: '字段名不能为空' })
  @Length(1, 64, { message: '字段名长度为1到64' })
  fieldName: string;

  // // @ApiProperty({ description: '当前数据节点在JSON中的类型,借鉴了JSON数据类型但不完全一样' })
  @IsNotEmpty({ message: '数据节点类型不能为空' })
  fieldType: VsDataConvertFieldTypeEnum;

  // // @ApiProperty({ description: '字段描述' })
  @IsOptional()
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
