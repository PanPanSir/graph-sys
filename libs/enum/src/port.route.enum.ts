/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';

/**
 * 端口条件表达式中的源数据的数值类型
 */
export enum VsPortRouteMetaDataTypeEnum {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  DOUBLE = 'DOUBLE',
  DATETIME = 'DATETIME',
}

// 验证工具类
export class VsPortRouteMetaDataTypeValidator {
  private static readonly logger = new Logger(
    VsPortRouteMetaDataTypeValidator.name,
  );

  /**
   * 验证值是否符合指定的数据类型
   * @param value 要验证的值
   * @param dataType 数据类型
   * @param nodeId 节点ID
   * @throws Error 当值不符合类型要求时抛出异常
   */
  public static validateAndThrowException(
    value: string,
    dataType: VsPortRouteMetaDataTypeEnum,
    nodeId: string,
  ): void {
    switch (dataType) {
      case VsPortRouteMetaDataTypeEnum.INTEGER:
        try {
          BigInt(value); // 使用BigInt代替Long以支持大整数
        } catch (error) {
          throw new Error(
            `值非法,值=${value},类型=${dataType},节点ID=${nodeId}`,
          );
        }
        break;

      case VsPortRouteMetaDataTypeEnum.DOUBLE:
        try {
          if (isNaN(parseFloat(value)))
            throw new Error(
              `值非法,值=${value},类型=${dataType},节点ID=${nodeId}`,
            );
        } catch (error) {
          throw new Error(
            `值非法,值=${value},类型=${dataType},节点ID=${nodeId}`,
          );
        }
        break;

      case VsPortRouteMetaDataTypeEnum.DATETIME:
        try {
          if (!dayjs(value, 'YYYY-MM-DD HH:mm:ss').isValid()) {
            throw new Error();
          }
        } catch (error) {
          throw new Error(
            `值非法,值=${value},类型=${dataType},节点ID=${nodeId}`,
          );
        }
        break;

      case VsPortRouteMetaDataTypeEnum.STRING:
        if (value === null) {
          throw new Error(`值不能为NULL,类型=${dataType},节点ID=${nodeId}`);
        }
        break;

      default:
        VsPortRouteMetaDataTypeValidator.logger.error(
          `不支持的数据类型, value = ${value}, dataType = ${dataType}, nodeId = ${nodeId}`,
        );
        throw new Error(
          `不支持的数据类型,值=${value},数据类型=${dataType},节点ID=${nodeId}`,
        );
    }
  }

  /**
   * 检查值是否匹配指定的数据类型
   * @param value 要检查的值
   * @param dataType 数据类型
   * @param nodeId 节点ID
   * @returns 如果值匹配类型则返回true，否则返回false
   */
  public static match(
    value: string,
    dataType: VsPortRouteMetaDataTypeEnum,
    nodeId: string,
  ): boolean {
    try {
      this.validateAndThrowException(value, dataType, nodeId);
      return true;
    } catch (error) {
      return false;
    }
  }
}
/**
 * 端口条件表达式中的源数据的数值 比较操作类型
 */
export enum VsPortRouteMetaOpTypeEnum {
  EQ = 'EQ',
  NE = 'NE',
  GT = 'GT',
  GE = 'GE',
  LT = 'LT',
  LE = 'LE',
}

// 描述信息映射
export const VsPortRouteMetaOpTypeDescription = {
  [VsPortRouteMetaOpTypeEnum.EQ]: '等于',
  [VsPortRouteMetaOpTypeEnum.NE]: '不等于',
  [VsPortRouteMetaOpTypeEnum.GT]: '大于',
  [VsPortRouteMetaOpTypeEnum.GE]: '大于等于',
  [VsPortRouteMetaOpTypeEnum.LT]: '小于',
  [VsPortRouteMetaOpTypeEnum.LE]: '小于等于',
};

// 比较操作符映射
export const VsPortRouteMetaOpTypeOperator = {
  [VsPortRouteMetaOpTypeEnum.EQ]: '==',
  [VsPortRouteMetaOpTypeEnum.NE]: '!=',
  [VsPortRouteMetaOpTypeEnum.GT]: '>',
  [VsPortRouteMetaOpTypeEnum.GE]: '>=',
  [VsPortRouteMetaOpTypeEnum.LT]: '<',
  [VsPortRouteMetaOpTypeEnum.LE]: '<=',
};

export enum VsPortRouteMetaSourceTypeEnum {
  REQ_HEADER = 'REQ_HEADER',
  REQ_PARAM = 'REQ_PARAM',
}
/**
 * get request header for code generate
 */
export const EXP_REQ_HEADER = 'this.getRequestHeader()';

/**
 * get request param for code generate
 */
export const EXP_REQ_PARAM = 'this.getRequestParam()';
// 为了支持枚举值的描述和表达式，我们可以创建辅助映射
export const VsPortRouteMetaSourceTypeDescription: Record<
  VsPortRouteMetaSourceTypeEnum,
  string
> = {
  [VsPortRouteMetaSourceTypeEnum.REQ_HEADER]: '请求头',
  [VsPortRouteMetaSourceTypeEnum.REQ_PARAM]: '请求参数',
};

export const VsPortRouteMetaSourceTypeExpression: Record<
  VsPortRouteMetaSourceTypeEnum,
  string
> = {
  [VsPortRouteMetaSourceTypeEnum.REQ_HEADER]: EXP_REQ_HEADER,
  [VsPortRouteMetaSourceTypeEnum.REQ_PARAM]: EXP_REQ_PARAM,
};

// 描述信息映射
export const VsPortRouteMetaDataTypeDescription = {
  [VsPortRouteMetaDataTypeEnum.STRING]: '字符串',
  [VsPortRouteMetaDataTypeEnum.INTEGER]: '整数',
  [VsPortRouteMetaDataTypeEnum.DOUBLE]: '浮点数',
  [VsPortRouteMetaDataTypeEnum.DATETIME]: '日期(yyyy-MM-dd HH:mm:ss)',
};

// 验证函数
export function validatePortRouteMetaDataType(
  value: string,
  dataType: VsPortRouteMetaDataTypeEnum,
  nodeId: string,
): void {
  switch (dataType) {
    case VsPortRouteMetaDataTypeEnum.INTEGER:
      try {
        BigInt(value); // 使用BigInt代替Long以支持大整数
      } catch (error) {
        throw new Error(`值非法,值=${value},类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    case VsPortRouteMetaDataTypeEnum.DOUBLE:
      try {
        if (isNaN(parseFloat(value))) throw new Error();
      } catch (error) {
        throw new Error(`值非法,值=${value},类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    case VsPortRouteMetaDataTypeEnum.DATETIME:
      try {
        if (isNaN(Date.parse(value))) throw new Error();
      } catch (error) {
        throw new Error(`值非法,值=${value},类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    case VsPortRouteMetaDataTypeEnum.STRING:
      if (value === null) {
        throw new Error(`值不能为NULL,类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    default:
      throw new Error(
        `不支持的数据类型,值=${value},数据类型=${dataType},节点ID=${nodeId}`,
      );
  }
}
// 描述信息映射
export const VS_PORT_ROUTE_META_DATA_TYPE_DESC: Record<
  VsPortRouteMetaDataTypeEnum,
  string
> = {
  [VsPortRouteMetaDataTypeEnum.STRING]: '字符串',
  [VsPortRouteMetaDataTypeEnum.INTEGER]: '整数',
  [VsPortRouteMetaDataTypeEnum.DOUBLE]: '浮点数',
  [VsPortRouteMetaDataTypeEnum.DATETIME]: '日期(yyyy-MM-dd HH:mm:ss)',
};

// 验证函数
export function validateRouteMetaDataType(
  value: string,
  dataType: VsPortRouteMetaDataTypeEnum,
  nodeId: string,
): void {
  const logger = new Logger('validateRouteMetaDataType');

  switch (dataType) {
    case VsPortRouteMetaDataTypeEnum.INTEGER:
      try {
        BigInt(value); // 使用BigInt来处理可能的大整数
      } catch (error) {
        throw new Error(`值非法,值=${value},类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    case VsPortRouteMetaDataTypeEnum.DOUBLE:
      try {
        if (isNaN(parseFloat(value))) {
          throw new Error();
        }
      } catch (error) {
        throw new Error(`值非法,值=${value},类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    case VsPortRouteMetaDataTypeEnum.DATETIME:
      try {
        const date = dayjs(value, 'YYYY-MM-DD HH:mm:ss', true);
        if (!date.isValid()) {
          throw new Error();
        }
      } catch (error) {
        throw new Error(`值非法,值=${value},类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    case VsPortRouteMetaDataTypeEnum.STRING:
      if (value === null) {
        throw new Error(`值不能为NULL,类型=${dataType},节点ID=${nodeId}`);
      }
      break;

    default:
      logger.error(
        `unsupported dataType, value = ${value}, dataType = ${dataType}, nodeId = ${nodeId}`,
      );
      throw new Error(
        `不支持的数据类型,值=${value},数据类型=${dataType},节点ID=${nodeId}`,
      );
  }
}

/**
 * 检查值是否匹配指定的数据类型
 * @param value 输入值，可能是请求参数值或请求头值
 * @param dataType 输入值类型，注意这不是TypeScript类型，而是自定义的类型
 * @param nodeId 对应节点的ID
 * @returns 如果输入值格式正确（可以转换为自定义类型）返回true，如果无法解析或当dataType为STRING时输入值为null则返回false
 */
export function matchRouteMetaDataType(
  value: string,
  dataType: VsPortRouteMetaDataTypeEnum,
  nodeId: string,
): boolean {
  const logger = new Logger('matchRouteMetaDataType');

  switch (dataType) {
    case VsPortRouteMetaDataTypeEnum.INTEGER:
      try {
        BigInt(value);
        return true;
      } catch (error) {
        logger.error(
          `parse ${value} failed, dataType = ${dataType}, nodeId = ${nodeId}`,
        );
        return false;
      }

    case VsPortRouteMetaDataTypeEnum.DOUBLE:
      try {
        if (isNaN(parseFloat(value))) {
          throw new Error();
        }
        return true;
      } catch (error) {
        logger.error(
          `parse ${value} failed, dataType = ${dataType}, nodeId = ${nodeId}`,
        );
        return false;
      }

    case VsPortRouteMetaDataTypeEnum.DATETIME:
      try {
        const date = dayjs(value, 'YYYY-MM-DD HH:mm:ss', true);
        return date.isValid();
      } catch (error) {
        logger.error(
          `parse ${value} failed, dataType = ${dataType}, nodeId = ${nodeId}`,
        );
        return false;
      }

    case VsPortRouteMetaDataTypeEnum.STRING:
      return value !== null;

    default:
      logger.error(
        `unsupported dataType, value = ${value}, dataType = ${dataType}, nodeId = ${nodeId}`,
      );
      return false;
  }
}
/**
 * 数据类型描述映射
 */
export const VsPortRouteMetaDataTypeDesc: Record<
  VsPortRouteMetaDataTypeEnum,
  string
> = {
  [VsPortRouteMetaDataTypeEnum.STRING]: '字符串',
  [VsPortRouteMetaDataTypeEnum.INTEGER]: '整数',
  [VsPortRouteMetaDataTypeEnum.DOUBLE]: '浮点数',
  [VsPortRouteMetaDataTypeEnum.DATETIME]: '日期(yyyy-MM-dd HH:mm:ss)',
};
