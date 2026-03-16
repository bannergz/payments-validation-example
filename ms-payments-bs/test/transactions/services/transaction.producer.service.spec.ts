import { Test, TestingModule } from '@nestjs/testing';
import { TransactionEventProducer } from '../../../src/transactions/services/transaction.producer.service.js';

describe('TransactionEventProducer', () => {
  let service: TransactionEventProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionEventProducer],
    }).compile();

    service = module.get<TransactionEventProducer>(TransactionEventProducer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
