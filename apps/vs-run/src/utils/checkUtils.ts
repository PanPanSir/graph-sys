import { VsHttpMethodEnum } from '@app/enum/port.enum';
import { Injectable } from '@nestjs/common';

// Exception class
class VsAdapterException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VsAdapterException';
  }
}

// Interfaces
interface VsExecFlow {
  method: VsHttpMethodEnum;
  // 其他属性根据实际需要定义
}

/**
 * 检查工具类 - NestJS版本
 * 从Java CheckUtil转换而来
 */
@Injectable()
export class CheckUtil {
  /**
   * 验证HTTP方法
   *
   * @param vsExecFlow 执行流对象
   * @param method 期望的HTTP方法
   * @throws VsAdapterException 当HTTP方法不匹配时抛出异常
   */
  static validateHttpMethod(
    vsExecFlow: VsExecFlow,
    method: VsHttpMethodEnum,
  ): void {
    if (vsExecFlow.method !== method) {
      throw new VsAdapterException(
        `请求方式不一致,当前请求方式为[${method}],要求的请求方式为[${vsExecFlow.method}]`,
      );
    }
  }
}

// 导出枚举和异常类以便外部使用
export { VsHttpMethodEnum, VsAdapterException, VsExecFlow };

// 导出静态方法以便直接使用
export const validateHttpMethod = CheckUtil.validateHttpMethod;
