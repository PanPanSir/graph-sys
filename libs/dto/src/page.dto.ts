export class Page<T> {
  current: number;
  size: number;
  total: number;
  records: T[];

  constructor(current: number, size: number, total: number, records: T[]) {
    this.current = current;
    this.size = size;
    this.total = total;
    this.records = records;
  }
}
