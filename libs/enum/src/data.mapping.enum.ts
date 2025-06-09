export enum DataConvertFieldTypeEnum {
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

  // array-array, for example: [[1],[2]], [[{}],[{}]]
  ARRAY_ARRAY = 'ARRAY_ARRAY',
}

// 枚举描述映射
export const DataConvertFieldTypeDesc: Record<
  DataConvertFieldTypeEnum,
  string
> = {
  [DataConvertFieldTypeEnum.STRING]: '字符串',
  [DataConvertFieldTypeEnum.BOOLEAN]: '布尔',
  [DataConvertFieldTypeEnum.INTEGER]: '整数',
  [DataConvertFieldTypeEnum.DOUBLE]: '小数',
  [DataConvertFieldTypeEnum.OBJECT]: '对象',
  [DataConvertFieldTypeEnum.ARRAY_STRING]: '数组-字符串',
  [DataConvertFieldTypeEnum.ARRAY_BOOLEAN]: '数组-布尔',
  [DataConvertFieldTypeEnum.ARRAY_INTEGER]: '数组-整数',
  [DataConvertFieldTypeEnum.ARRAY_DOUBLE]: '数组-小数',
  [DataConvertFieldTypeEnum.ARRAY_OBJECT]: '数组-对象',
  [DataConvertFieldTypeEnum.ARRAY_ARRAY]: '数组-数组',
};

// 工具函数
export class DataConvertFieldTypeUtil {
  /**
   * only atomic type(STRING/BOOLEAN/INTEGER/DOUBLE) return true
   */
  static isAtomicType(type: DataConvertFieldTypeEnum): boolean {
    return [
      DataConvertFieldTypeEnum.STRING,
      DataConvertFieldTypeEnum.BOOLEAN,
      DataConvertFieldTypeEnum.INTEGER,
      DataConvertFieldTypeEnum.DOUBLE,
    ].includes(type);
  }

  /**
   * only atomic type(STRING/BOOLEAN/INTEGER/DOUBLE)
   * or array-atomic type(ARRAY_STRING/ARRAY_BOOLEAN/ARRAY_INTEGER/ARRAY_DOUBLE) return true
   */
  static isAtomicTypeOrArrayAtomicType(
    type: DataConvertFieldTypeEnum,
  ): boolean {
    return this.isAtomicType(type) || this.isArrayAtomicType(type);
  }

  /**
   * Check if type is array atomic type
   */
  static isArrayAtomicType(type: DataConvertFieldTypeEnum): boolean {
    return [
      DataConvertFieldTypeEnum.ARRAY_STRING,
      DataConvertFieldTypeEnum.ARRAY_BOOLEAN,
      DataConvertFieldTypeEnum.ARRAY_INTEGER,
      DataConvertFieldTypeEnum.ARRAY_DOUBLE,
    ].includes(type);
  }

  /**
   * Check if type is array object type or array atomic type
   */
  static isArrayObjectTypeOrArrayAtomicType(
    type: DataConvertFieldTypeEnum,
  ): boolean {
    return this.isArrayObjectType(type) || this.isArrayAtomicType(type);
  }

  /**
   * Check if type is object type
   */
  static isObjectType(type: DataConvertFieldTypeEnum): boolean {
    return type === DataConvertFieldTypeEnum.OBJECT;
  }

  /**
   * Check if type is array object type
   */
  static isArrayObjectType(type: DataConvertFieldTypeEnum): boolean {
    return type === DataConvertFieldTypeEnum.ARRAY_OBJECT;
  }

  /**
   * Check if type is array array type
   */
  static isArrayArrayType(type: DataConvertFieldTypeEnum): boolean {
    return type === DataConvertFieldTypeEnum.ARRAY_ARRAY;
  }

  /**
   * Check if type is array type
   */
  static isArrayType(type: DataConvertFieldTypeEnum): boolean {
    return (
      this.isAtomicTypeOrArrayAtomicType(type) ||
      type === DataConvertFieldTypeEnum.ARRAY_ARRAY
    );
  }
}

export enum VsApiParamEnum {
  STRING = 'STRING',
  FLOAT = 'FLOAT',
  BOOLEAN = 'BOOLEAN',
  INTEGER = 'INTEGER',
}

// 为了支持枚举值的描述，我们可以创建一个辅助映射
export const VsApiParamDescription: Record<VsApiParamEnum, string> = {
  [VsApiParamEnum.STRING]: '字符串',
  [VsApiParamEnum.FLOAT]: '浮点数',
  [VsApiParamEnum.BOOLEAN]: '布尔类型',
  [VsApiParamEnum.INTEGER]: '整数',
};

export enum VsApiTypeEnum {
  VENDOR = 'VENDOR',
  STANDARD = 'STANDARD',
}

// 为了支持枚举值的描述，我们可以创建一个辅助映射
export const VsApiTypeDescription: Record<VsApiTypeEnum, string> = {
  [VsApiTypeEnum.VENDOR]: '机构/厂商接口',
  [VsApiTypeEnum.STANDARD]: '标准接口',
};

export enum VsDataConvertTypeEnum {
  REQ_PARAM = 'REQ_PARAM',
  REQ_BODY = 'REQ_BODY',
  RESP_BODY = 'RESP_BODY',
}

// 为了支持枚举值的描述，我们可以创建一个辅助映射
export const VsDataConvertTypeDescription: Record<
  VsDataConvertTypeEnum,
  string
> = {
  [VsDataConvertTypeEnum.REQ_PARAM]: '请求参数',
  [VsDataConvertTypeEnum.REQ_BODY]: '请求体',
  [VsDataConvertTypeEnum.RESP_BODY]: '响应体',
};
