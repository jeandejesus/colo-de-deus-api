import { Test, TestingModule } from '@nestjs/testing';
import { LiturgiaService } from './liturgia.service';

describe('LiturgiaService', () => {
  let service: LiturgiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiturgiaService],
    }).compile();

    service = module.get<LiturgiaService>(LiturgiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
