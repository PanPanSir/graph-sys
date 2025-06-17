import { Injectable } from '@nestjs/common';

@Injectable()
export class VsRunService {
  getHello(): string {
    return 'Hello World!';
  }
}
