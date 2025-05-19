import { Module } from '@nestjs/common';
import { VsAdapterController } from './vs-adapter.controller';
import { VsAdapterService } from './vs-adapter.service';
import { VsProjectService } from './services/vs-project.service';
import { VsNodeService } from './services/vs-node.service';
import { VsLogService } from './services/vs-log.service';
import { ProjectModule } from './project/project.module';
import { NodeModule } from './node/node.module';
import { LinkModule } from './link/link.module';
import { PortModule } from './port/port.module';
import { NodeModule } from './node/node.module';

@Module({
  controllers: [VsAdapterController],
  providers: [VsAdapterService, VsProjectService, VsNodeService, VsLogService],
  imports: [ProjectModule, NodeModule, PortModule, LinkModule],
})
export class VsAdapterModule {}
