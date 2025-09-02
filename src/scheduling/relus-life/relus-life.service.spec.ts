import { Test, TestingModule } from '@nestjs/testing';
import { RelusLifeService } from './relus-life.service';

describe('RelusLifeService', () => {
  let service: RelusLifeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelusLifeService],
    }).compile();

    service = module.get<RelusLifeService>(RelusLifeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
