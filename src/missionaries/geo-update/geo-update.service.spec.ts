import { Test, TestingModule } from '@nestjs/testing';
import { GeoUpdateService } from './geo-update.service';

describe('GeoUpdateService', () => {
  let service: GeoUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoUpdateService],
    }).compile();

    service = module.get<GeoUpdateService>(GeoUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
