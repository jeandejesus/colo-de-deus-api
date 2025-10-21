import { Test, TestingModule } from '@nestjs/testing';
import { LiturgiaController } from './liturgia.controller';

describe('LiturgiaController', () => {
  let controller: LiturgiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiturgiaController],
    }).compile();

    controller = module.get<LiturgiaController>(LiturgiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
