import { Module } from '@nestjs/common';
import { VsAdapterController } from './vs-adapter.controller';
import { VsAdapterService } from './vs-adapter.service';
import { VsProjectService } from './services/vs-project.service';
import { VsNodeService } from './services/vs-node.service';
import { VsLogService } from './services/vs-log.service';

@Module({
  controllers: [VsAdapterController],
  providers: [VsAdapterService, VsProjectService, VsNodeService, VsLogService],
})
export class VsAdapterModule {}
