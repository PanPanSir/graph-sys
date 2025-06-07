import { Injectable, Logger } from '@nestjs/common';
import { format, parse, parseISO, startOfDay, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 日期时间工具类 - NestJS版本
 * 提供日期时间格式化、解析和处理功能
 */
@Injectable()
export class DateTimeUtil {
  private static readonly logger = new Logger(DateTimeUtil.name);

  /**
   * 日期时间格式常量
   */
  public static readonly YYYY_MM_ddTHH_mm_ss = 'yyyy-MM-dd\'T\'HH:mm:ss';
  public static readonly YYYYMMddHHmmss = 'yyyyMMddHHmmss';
  public static readonly YYYY_MM_dd_HH_mm_ss = 'yyyy-MM-dd HH:mm:ss';
  public static readonly YYYY_MM_dd = 'yyyy-MM-dd';
  public static readonly HH_mm_ss = 'HH:mm:ss';

  /**
   * 重置时间，把时分秒设置为0
   * @param dateTime 要重置的日期时间
   * @returns 重置后的日期时间
   */
  public static resetHourMinSec(dateTime: Date): Date {
    if (!dateTime) {
      return null;
    }
    return startOfDay(dateTime);
  }

  /**
   * 重置时间，把时分设置为指定值，秒为0
   * @param dateTime 要重置的日期时间
   * @param hour 小时值 (0-23)
   * @param min 分钟值 (0-59)
   * @returns 重置后的日期时间
   */
  public static resetHourMinSecWithHourMin(dateTime: Date, hour: number, min: number): Date {
    return DateTimeUtil.resetHourMinSecWithHourMinSec(dateTime, hour, min, 0);
  }

  /**
   * 重置时间，把时分秒设置为指定值
   * @param dateTime 要重置的日期时间
   * @param hour 小时值 (0-23)
   * @param min 分钟值 (0-59)
   * @param sec 秒值 (0-59)
   * @returns 重置后的日期时间
   */
  public static resetHourMinSecWithHourMinSec(dateTime: Date, hour: number, min: number, sec: number): Date {
    if (!dateTime) {
      return null;
    }

    let result = setHours(dateTime, hour);
    result = setMinutes(result, min);
    result = setSeconds(result, sec);
    result = setMilliseconds(result, 0);

    return result;
  }

  /**
   * 解析日期时间字符串，如果解析失败则返回默认值
   * @param dateTimeStr 日期时间字符串
   * @param defaultVal 默认值
   * @returns 解析后的日期时间或默认值
   */
  public static parse(dateTimeStr: string, defaultVal: Date): Date {
    try {
      if (!dateTimeStr || dateTimeStr.trim().length === 0) {
        return defaultVal;
      }

      // 尝试解析ISO格式
      return parseISO(dateTimeStr);
    } catch (ex) {
      // 忽略异常，返回默认值
      DateTimeUtil.logger.debug(`Failed to parse date string: ${dateTimeStr}`, ex);
    }
    return defaultVal;
  }

  /**
   * 使用指定格式解析日期时间字符串
   * @param dateTimeStr 日期时间字符串
   * @param formatPattern 格式模式
   * @param defaultVal 默认值
   * @returns 解析后的日期时间或默认值
   */
  public static parseWithFormat(dateTimeStr: string, formatPattern: string, defaultVal: Date): Date {
    try {
      if (!dateTimeStr || dateTimeStr.trim().length === 0) {
        return defaultVal;
      }

      // 使用date-fns的parse函数
      const referenceDate = new Date();
      return parse(dateTimeStr, formatPattern, referenceDate);
    } catch (ex) {
      DateTimeUtil.logger.debug(`Failed to parse date string with format: ${dateTimeStr}, format: ${formatPattern}`, ex);
    }
    return defaultVal;
  }

  /**
   * 解析常用格式的日期时间字符串
   * @param dateTimeStr 日期时间字符串
   * @returns 解析后的日期时间，失败返回null
   */
  public static parseDateTime(dateTimeStr: string): Date {
    if (!dateTimeStr || dateTimeStr.trim().length === 0) {
      return null;
    }

    const trimmedStr = dateTimeStr.trim();

    // 尝试解析各种常用格式
    const formats = [
      DateTimeUtil.YYYY_MM_dd_HH_mm_ss,
      DateTimeUtil.YYYY_MM_ddTHH_mm_ss,
      DateTimeUtil.YYYYMMddHHmmss,
      DateTimeUtil.YYYY_MM_dd,
      DateTimeUtil.HH_mm_ss
    ];

    for (const formatPattern of formats) {
      try {
        const referenceDate = new Date();
        const result = parse(trimmedStr, formatPattern, referenceDate);
        if (!isNaN(result.getTime())) {
          return result;
        }
      } catch (ex) {
        // 继续尝试下一个格式
      }
    }

    // 最后尝试ISO格式
    try {
      return parseISO(trimmedStr);
    } catch (ex) {
      DateTimeUtil.logger.debug(`Failed to parse date string: ${dateTimeStr}`);
    }

    return null;
  }

  /**
   * 格式化日期时间为字符串
   * @param dateTime 日期时间
   * @param formatPattern 格式模式
   * @returns 格式化后的字符串
   */
  public static format(dateTime: Date, formatPattern: string): string {
    if (!dateTime) {
      return '';
    }

    try {
      return format(dateTime, formatPattern, { locale: zhCN });
    } catch (ex) {
      DateTimeUtil.logger.error(`Failed to format date: ${dateTime}, format: ${formatPattern}`, ex);
      return '';
    }
  }

  /**
   * 格式化为 yyyy-MM-dd HH:mm:ss 格式
   * @param dateTime 日期时间
   * @returns 格式化后的字符串
   */
  public static formatToYYYY_MM_dd_HH_mm_ss(dateTime: Date): string {
    return DateTimeUtil.format(dateTime, DateTimeUtil.YYYY_MM_dd_HH_mm_ss);
  }

  /**
   * 格式化为 yyyy-MM-dd'T'HH:mm:ss 格式
   * @param dateTime 日期时间
   * @returns 格式化后的字符串
   */
  public static formatToYYYY_MM_ddTHH_mm_ss(dateTime: Date): string {
    return DateTimeUtil.format(dateTime, DateTimeUtil.YYYY_MM_ddTHH_mm_ss);
  }

  /**
   * 格式化为 yyyyMMddHHmmss 格式
   * @param dateTime 日期时间
   * @returns 格式化后的字符串
   */
  public static formatToYYYYMMddHHmmss(dateTime: Date): string {
    return DateTimeUtil.format(dateTime, DateTimeUtil.YYYYMMddHHmmss);
  }

  /**
   * 格式化为 yyyy-MM-dd 格式
   * @param dateTime 日期时间
   * @returns 格式化后的字符串
   */
  public static formatToYYYY_MM_dd(dateTime: Date): string {
    return DateTimeUtil.format(dateTime, DateTimeUtil.YYYY_MM_dd);
  }

  /**
   * 格式化为 HH:mm:ss 格式
   * @param dateTime 日期时间
   * @returns 格式化后的字符串
   */
  public static formatToHH_mm_ss(dateTime: Date): string {
    return DateTimeUtil.format(dateTime, DateTimeUtil.HH_mm_ss);
  }

  /**
   * 获取当前日期时间
   * @returns 当前日期时间
   */
  public static now(): Date {
    return new Date();
  }

  /**
   * 获取今天的开始时间 (00:00:00)
   * @returns 今天的开始时间
   */
  public static startOfToday(): Date {
    return startOfDay(new Date());
  }

  /**
   * 检查日期是否有效
   * @param dateTime 日期时间
   * @returns 是否有效
   */
  public static isValid(dateTime: Date): boolean {
    return dateTime instanceof Date && !isNaN(dateTime.getTime());
  }

  /**
   * 比较两个日期是否相等（忽略时间部分）
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否相等
   */
  public static isSameDay(date1: Date, date2: Date): boolean {
    if (!DateTimeUtil.isValid(date1) || !DateTimeUtil.isValid(date2)) {
      return false;
    }

    return DateTimeUtil.formatToYYYY_MM_dd(date1) === DateTimeUtil.formatToYYYY_MM_dd(date2);
  }

  /**
   * 添加天数
   * @param dateTime 基准日期时间
   * @param days 要添加的天数
   * @returns 新的日期时间
   */
  public static addDays(dateTime: Date, days: number): Date {
    if (!DateTimeUtil.isValid(dateTime)) {
      return null;
    }

    const result = new Date(dateTime);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 添加小时
   * @param dateTime 基准日期时间
   * @param hours 要添加的小时数
   * @returns 新的日期时间
   */
  public static addHours(dateTime: Date, hours: number): Date {
    if (!DateTimeUtil.isValid(dateTime)) {
      return null;
    }

    const result = new Date(dateTime);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * 添加分钟
   * @param dateTime 基准日期时间
   * @param minutes 要添加的分钟数
   * @returns 新的日期时间
   */
  public static addMinutes(dateTime: Date, minutes: number): Date {
    if (!DateTimeUtil.isValid(dateTime)) {
      return null;
    }

    const result = new Date(dateTime);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }
}