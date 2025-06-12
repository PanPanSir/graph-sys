import { Module } from '@nestjs/common';
import { VsAdapterController } from './vs-adapter.controller';
import { VsAdapterService } from './vs-adapter.service';
import { VsLogService } from './services/vs-log.service';
import { ProjectModule } from './project/project.module';
import { LinkModule } from './link/link.module';
import { PortModule } from './port/port.module';
import { NodeModule } from './node/node.module';
import { FlowModule } from './flow/flow.module';

@Module({
  controllers: [VsAdapterController],
  providers: [VsAdapterService, VsLogService],
  imports: [ProjectModule, NodeModule, PortModule, LinkModule, FlowModule],
})
export class VsAdapterModule {}
