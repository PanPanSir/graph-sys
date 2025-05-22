import { Injectable } from '@nestjs/common';
import { AddPortDto } from './dto/add-port.dto';

@Injectable()
export class PortService {
  create(createPortDto: AddPortDto) {
    return 'This action adds a new port' + createPortDto;
  }

  findAll() {
    return `This action returns all port`;
  }

  findOne(id: number) {
    return `This action returns a #${id} port`;
  }

  remove(id: number) {
    return `This action removes a #${id} port`;
  }
}
