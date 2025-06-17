import { Test, TestingModule } from '@nestjs/testing';
import { VsAdapterService } from './vs-adapter.service';

describe('VsAdapterService', () => {
  let service: VsAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VsAdapterService],
    }).compile();

    service = module.get<VsAdapterService>(VsAdapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
