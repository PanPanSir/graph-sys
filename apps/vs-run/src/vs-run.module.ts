import { Module } from '@nestjs/common';
import { VsRunController } from './vs-run.controller';
import { VsRunService } from './vs-run.service';
import { VsAdapterModule } from './vs-adapter/vs-adapter.module';
import { VsProjectServiceService } from './vs-project/vs-project.service';

@Module({
  controllers: [VsRunController],
  providers: [VsRunService, VsProjectServiceService],
  imports: [VsAdapterModule],
})
export class VsRunModule {}
