import { Injectable } from '@nestjs/common';
import { CreateVsAdapterDto } from './dto/create-vs-adapter.dto';
import { UpdateVsAdapterDto } from './dto/update-vs-adapter.dto';

@Injectable()
export class VsAdapterService {
  create(createVsAdapterDto: CreateVsAdapterDto) {
    return 'This action adds a new vsAdapter';
  }

  findAll() {
    return `This action returns all vsAdapter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vsAdapter`;
  }

  update(id: number, updateVsAdapterDto: UpdateVsAdapterDto) {
    return `This action updates a #${id} vsAdapter`;
  }

  remove(id: number) {
    return `This action removes a #${id} vsAdapter`;
  }
}
