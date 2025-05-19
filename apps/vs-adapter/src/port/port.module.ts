import { Module } from '@nestjs/common';
import { PortService } from './port.service';
import { PortController } from './port.controller';

@Module({
  controllers: [PortController],
  providers: [PortService],
})
export class PortModule {}
