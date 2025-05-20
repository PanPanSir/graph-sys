export class ResultInfo<T> {
  statusCode: number;

  message: string;

  data: T;

  constructor(data?: T, message: string = 'success') {
    this.statusCode = 200;
    this.message = message;
    this.data = data;
  }

  static fail(message: string, code: number = 500): ResultInfo<null> {
    const result = new ResultInfo<null>();
    result.statusCode = code;
    result.message = message;
    result.data = null;
    return result;
  }
}
