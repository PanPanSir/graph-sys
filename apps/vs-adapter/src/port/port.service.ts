import { Injectable } from '@nestjs/common';
import { CreatePortDto } from './dto/add-port.dto';
import { UpdatePortDto } from './dto/update-port1.dto';

@Injectable()
export class PortService {
  create(createPortDto: CreatePortDto) {
    return 'This action adds a new port';
  }

  findAll() {
    return `This action returns all port`;
  }

  findOne(id: number) {
    return `This action returns a #${id} port`;
  }

  update(id: number, updatePortDto: UpdatePortDto) {
    return `This action updates a #${id} port`;
  }

  remove(id: number) {
    return `This action removes a #${id} port`;
  }
}
