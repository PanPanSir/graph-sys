/**
 * 数据转换字段类型枚举
 */
export enum VsDataConvertFieldTypeEnum {
  // atomic type
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  INTEGER = 'INTEGER',
  DOUBLE = 'DOUBLE',

  // simple object, {}
  OBJECT = 'OBJECT',

  // array-atomic type, ["a", "b"], [1,2,3], [true,false], [1.1, 1.2]
  ARRAY_STRING = 'ARRAY_STRING',
  ARRAY_BOOLEAN = 'ARRAY_BOOLEAN',
  ARRAY_INTEGER = 'ARRAY_INTEGER',
  ARRAY_DOUBLE = 'ARRAY_DOUBLE',

  // array-object type, [{},{}]
  ARRAY_OBJECT = 'ARRAY_OBJECT',

  // array-array, for example: [[1],[2]],  [[{}],[{}]]
  ARRAY_ARRAY = 'ARRAY_ARRAY',
}

/**
 * 枚举描述映射
 */
export const VsDataConvertFieldTypeDescMap: Record<
  VsDataConvertFieldTypeEnum,
  string
> = {
  [VsDataConvertFieldTypeEnum.STRING]: '字符串',
  [VsDataConvertFieldTypeEnum.BOOLEAN]: '布尔',
  [VsDataConvertFieldTypeEnum.INTEGER]: '整数',
  [VsDataConvertFieldTypeEnum.DOUBLE]: '小数',
  [VsDataConvertFieldTypeEnum.OBJECT]: '对象',
  [VsDataConvertFieldTypeEnum.ARRAY_STRING]: '数组-字符串',
  [VsDataConvertFieldTypeEnum.ARRAY_BOOLEAN]: '数组-布尔',
  [VsDataConvertFieldTypeEnum.ARRAY_INTEGER]: '数组-整数',
  [VsDataConvertFieldTypeEnum.ARRAY_DOUBLE]: '数组-小数',
  [VsDataConvertFieldTypeEnum.ARRAY_OBJECT]: '数组-对象',
  [VsDataConvertFieldTypeEnum.ARRAY_ARRAY]: '数组-数组',
};

/**
 * 枚举工具类
 */
export class VsDataConvertFieldTypeUtils {
  /**
   * 获取枚举描述
   */
  static getDesc(typeEnum: VsDataConvertFieldTypeEnum): string {
    return VsDataConvertFieldTypeDescMap[typeEnum];
  }

  /**
   * 获取枚举代码值
   */
  static getCode(typeEnum: VsDataConvertFieldTypeEnum): string {
    return typeEnum;
  }

  /**
   * only atomic type(STRING/BOOLEAN/INTEGER/DOUBLE) return true
   */
  static isAtomicType(typeEnum: VsDataConvertFieldTypeEnum): boolean {
    return (
      typeEnum === VsDataConvertFieldTypeEnum.STRING ||
      typeEnum === VsDataConvertFieldTypeEnum.BOOLEAN ||
      typeEnum === VsDataConvertFieldTypeEnum.INTEGER ||
      typeEnum === VsDataConvertFieldTypeEnum.DOUBLE
    );
  }

  /**
   * only atomic type(STRING/BOOLEAN/INTEGER/DOUBLE)
   * or array-atomic type(ARRAY_STRING/ARRAY_BOOLEAN/ARRAY_INTEGER/ARRAY_DOUBLE) return true
   */
  static isAtomicTypeOrArrayAtomicType(
    typeEnum: VsDataConvertFieldTypeEnum,
  ): boolean {
    return (
      this.isAtomicType(typeEnum) ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_STRING ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_BOOLEAN ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_INTEGER ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_DOUBLE
    );
  }

  /**
   * 判断是否为数组原子类型
   */
  static isArrayAtomicType(typeEnum: VsDataConvertFieldTypeEnum): boolean {
    return (
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_STRING ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_BOOLEAN ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_INTEGER ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_DOUBLE
    );
  }

  /**
   * 判断是否为数组对象类型或数组原子类型
   */
  static isArrayObjectTypeOrArrayAtomicType(
    typeEnum: VsDataConvertFieldTypeEnum,
  ): boolean {
    return this.isArrayObjectType(typeEnum) || this.isArrayAtomicType(typeEnum);
  }

  /**
   * 判断是否为对象类型
   */
  static isObjectType(typeEnum: VsDataConvertFieldTypeEnum): boolean {
    return typeEnum === VsDataConvertFieldTypeEnum.OBJECT;
  }

  /**
   * 判断是否为数组对象类型
   */
  static isArrayObjectType(typeEnum: VsDataConvertFieldTypeEnum): boolean {
    return typeEnum === VsDataConvertFieldTypeEnum.ARRAY_OBJECT;
  }

  /**
   * 判断是否为数组数组类型
   */
  static isArrayArrayType(typeEnum: VsDataConvertFieldTypeEnum): boolean {
    return typeEnum === VsDataConvertFieldTypeEnum.ARRAY_ARRAY;
  }

  /**
   * 判断是否为数组类型
   */
  static isArrayType(typeEnum: VsDataConvertFieldTypeEnum): boolean {
    return (
      this.isAtomicTypeOrArrayAtomicType(typeEnum) ||
      typeEnum === VsDataConvertFieldTypeEnum.ARRAY_ARRAY
    );
  }
}
