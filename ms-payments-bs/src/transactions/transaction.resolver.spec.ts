import { Test, TestingModule } from '@nestjs/testing';
import { TransactionResolver } from './transaction.resolver.js';
import { TransactionService } from './services/transaction.service.js';
import { TransactionMapper } from './mappers/transaction.mapper.js';

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
