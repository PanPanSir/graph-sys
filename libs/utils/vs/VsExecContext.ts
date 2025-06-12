import { Injectable, Logger } from '@nestjs/common';

export enum TimeUnit {
  MILLISECONDS = 'MILLISECONDS',
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
}

export class TimeUnitHelper {
  static convertToMilliseconds(duration: number, unit: TimeUnit): number {
    switch (unit) {
      case TimeUnit.MILLISECONDS:
        return duration;
      case TimeUnit.SECONDS:
        return duration * 1000;
      case TimeUnit.MINUTES:
        return duration * 60 * 1000;
      case TimeUnit.HOURS:
        return duration * 60 * 60 * 1000;
      case TimeUnit.DAYS:
        return duration * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }
}

interface ScheduledTask {
  timeoutId: NodeJS.Timeout;
  key: string;
}

@Injectable()
export class VsExecContext {
  private static readonly logger = new Logger(VsExecContext.name);

  // 模拟Java的ScheduledExecutorService，管理所有定时任务
  private static readonly scheduledTasks = new Map<string, ScheduledTask>();
  private static taskCounter = 0;

  // @ApiProperty({ description: '上下文数据存储' })
  private readonly contextMap = new Map<string, any>();

  // @ApiProperty({ description: '过期任务映射，用于管理每个key对应的清理任务' })
  private readonly expiredTaskMap = new Map<string, ScheduledTask>();

  private readonly lock = {}; // Node.js中用对象模拟锁

  /**
   * 获取上下文中的值
   * @param key 键
   * @returns 对应的值
   */
  get(key: string): any {
    // Node.js是单线程的，不需要synchronized
    return this.contextMap.get(key);
  }

  /**
   * 设置上下文值，并安排在指定时间后自动清理
   * @param key 键
   * @param value 值
   * @param duration 持续时间
   * @param timeUnit 时间单位
   */
  set(key: string, value: any, duration: number, timeUnit: TimeUnit): void {
    // 取消之前的清理任务（如果存在）
    const existingTask = this.expiredTaskMap.get(key);
    if (existingTask) {
      clearTimeout(existingTask.timeoutId);
      VsExecContext.scheduledTasks.delete(existingTask.key);
      VsExecContext.logger.debug(
        `Cancelled existing cleanup task for key: ${key}`,
      );
    }

    // 设置新值
    this.contextMap.set(key, value);

    // 计算延迟时间（毫秒）
    const delayMs = TimeUnitHelper.convertToMilliseconds(duration, timeUnit);

    // 创建新的清理任务
    const taskKey = `task_${++VsExecContext.taskCounter}_${key}`;
    const timeoutId = setTimeout(() => {
      // 清理过期数据
      this.contextMap.delete(key);
      this.expiredTaskMap.delete(key);
      VsExecContext.scheduledTasks.delete(taskKey);
      VsExecContext.logger.debug(`Cleaned up expired context for key: ${key}`);
    }, delayMs);

    // 保存任务引用
    const scheduledTask: ScheduledTask = {
      timeoutId,
      key: taskKey,
    };

    this.expiredTaskMap.set(key, scheduledTask);
    VsExecContext.scheduledTasks.set(taskKey, scheduledTask);

    VsExecContext.logger.debug(
      `Set context key: ${key}, will expire in ${duration} ${timeUnit}`,
    );
  }

  /**
   * 获取当前上下文的字符串表示
   * @returns 上下文内容的字符串
   */
  toString(): string {
    const entries = Array.from(this.contextMap.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
    return `VsExecContext{${entries}}`;
  }

  /**
   * 清理所有上下文数据和定时任务
   */
  clear(): void {
    // 取消所有定时任务
    this.expiredTaskMap.forEach((task) => {
      clearTimeout(task.timeoutId);
      VsExecContext.scheduledTasks.delete(task.key);
    });

    // 清空所有数据
    this.contextMap.clear();
    this.expiredTaskMap.clear();

    VsExecContext.logger.debug('Cleared all context data and scheduled tasks');
  }

  /**
   * 获取当前活跃的任务数量（用于监控）
   */
  getActiveTaskCount(): number {
    return VsExecContext.scheduledTasks.size;
  }

  /**
   * 获取当前上下文数据数量
   */
  getContextSize(): number {
    return this.contextMap.size;
  }
}
