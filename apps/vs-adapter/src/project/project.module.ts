import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { NodeModule } from '../node/node.module';

@Module({
  imports: [NodeModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
