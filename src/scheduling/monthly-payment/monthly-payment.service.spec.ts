import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyPaymentService } from './monthly-payment.service';

describe('MonthlyPaymentService', () => {
  let service: MonthlyPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthlyPaymentService],
    }).compile();

    service = module.get<MonthlyPaymentService>(MonthlyPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
