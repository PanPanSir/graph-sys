import { Module } from '@nestjs/common';
import { VsAdapterService } from './vs-adapter.service';
import { VsAdapterController } from './vs-adapter.controller';

@Module({
  controllers: [VsAdapterController],
  providers: [VsAdapterService],
})
export class VsAdapterModule {}
