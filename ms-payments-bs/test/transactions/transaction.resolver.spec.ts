import { Test, TestingModule } from '@nestjs/testing';
import { TransactionResolver } from '../../src/transactions/transaction.resolver.js';
import { TransactionService } from '../../src/transactions/services/transaction.service.js';
import { TransactionMapper } from '../../src/transactions/mappers/transaction.mapper.js';

// Mocks
class TransactionServiceMock {}
class TransactionMapperMock {}

describe('TransactionResolver', () => {
  let resolver: TransactionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionResolver,
        { provide: TransactionService, useClass: TransactionServiceMock },
        { provide: TransactionMapper, useClass: TransactionMapperMock },
      ],
    }).compile();

    resolver = module.get<TransactionResolver>(TransactionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
