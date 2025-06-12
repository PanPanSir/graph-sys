import { IsNotEmpty, IsOptional } from 'class-validator';
import { VsDataConvertFieldTypeEnum } from '../enums/vs-data-convert-field-type.enum';
import { Logger } from '@nestjs/common';

/**
 * 树形结构表示映射关系中的平铺结构数据
 */
export class TreeNode {
  private static readonly logger = new Logger(TreeNode.name);

  // @ApiProperty({ description: '字段名,代表了应该生成的JSON字段名字' })
  @IsNotEmpty()
  fieldName: string;

  // @ApiProperty({
  //   description: '当前数据节点在JSON中的类型,借鉴了JSON数据类型但不完全一样',
  // })
  fieldType: VsDataConvertFieldTypeEnum;

  // @ApiProperty({ description: '字段描述' })
  @IsOptional()
  desc?: string;

  // @ApiProperty({
  // description: '子节点描述,仅当当前数据节点类型为OBJECT/ARRAY-OBJECT时生效',
  // type: [TreeNode],
  // })
  @IsOptional()
  children?: TreeNode[];

  // ------------------------------  下面属性由后端自动生成 ------------------------------

  // @ApiProperty({ description: 'ID,代表当前节点ID' })
  @IsOptional()
  id?: string;

  // @ApiProperty({ description: '父ID,代表了所属上一层的ID,0表示当前节点就是根' })
  @IsOptional()
  pid?: string;

  // @ApiProperty({ description: '父节点,根节点父节点为NULL' })
  @IsOptional()
  parent?: TreeNode;

  // @ApiProperty({ description: '当前数据在Java类中的变量名' })
  @IsOptional()
  javaVarName?: string;

  // @ApiProperty({
  //   description: '类名,当字段类型为OBJECT或者ARRAY-OBJECT时才需要生成类名',
  // })
  @IsOptional()
  javaClassName?: string;

  // @ApiProperty({
  //   description: '当前数据节点在Java中的类型(字符串表示用于方便生成代码)',
  // })
  @IsOptional()
  javaVarType?: string;

  constructor(
    fieldName?: string,
    fieldType?: VsDataConvertFieldTypeEnum,
    id?: string,
    pid?: string,
  ) {
    if (fieldName) this.fieldName = fieldName;
    if (fieldType) this.fieldType = fieldType;
    if (id) this.id = id;
    if (pid) this.pid = pid;
  }

  toString(): string {
    return `TreeNode{fieldName='${this.fieldName}', fieldType=${this.fieldType}}`;
  }

  /**
   * check name is in children
   * if name exists in children and type is different, throw exception.
   */
  static childContainsNameAndCheckDuplicate(
    children: TreeNode[] | null | undefined,
    name: string,
    fieldType: VsDataConvertFieldTypeEnum,
  ): boolean {
    if (!children) {
      return false;
    }

    for (const child of children) {
      if (child.fieldName === name) {
        if (child.fieldType === fieldType) {
          return true;
        } else {
          TreeNode.logger.error(
            `field ${child.fieldName} type is ${child.fieldType}, can not change it's type to ${fieldType}`,
          );
          throw new Error(
            `字段[${child.fieldName}]已经存在,类型为[${child.fieldType}],当前重复定义类型为[${fieldType}]`,
          );
        }
      }
    }
    return false;
  }

  /**
   * add a child node to current node
   */
  addChild(child: TreeNode): void {
    if (!child) {
      throw new Error('添加孩子节点的参数非法,不能传NULL');
    }

    if (!this.children) {
      this.children = [];
    }

    this.children.push(child);
  }

  /**
   * get the first child by name.
   */
  getChildByName(name: string): TreeNode | null {
    if (!name) {
      throw new Error('name parameter cannot be null or empty');
    }

    if (!this.children) {
      return null;
    }

    for (const child of this.children) {
      if (name === child.fieldName) {
        return child;
      }
    }

    return null;
  }
}
