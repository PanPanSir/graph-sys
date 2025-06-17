import { Test, TestingModule } from '@nestjs/testing';
import { VsRunController } from './vs-run.controller';
import { VsRunService } from './vs-run.service';

describe('VsRunController', () => {
  let vsRunController: VsRunController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VsRunController],
      providers: [VsRunService],
    }).compile();

    vsRunController = app.get<VsRunController>(VsRunController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(vsRunController.getHello()).toBe('Hello World!');
    });
  });
});
