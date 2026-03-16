import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../../src/transactions/services/transaction.service.js';
import { PrismaService } from '../../../src/db/prisma.service.js';
import { TransactionMapper } from '../../../src/transactions/mappers/transaction.mapper.js';
import { TransactionEventProducer } from '../../../src/transactions/services/transaction.producer.service.js';

// Mocks
class PrismaServiceMock {}
class TransactionMapperMock {}
class TransactionEventProducerMock {}

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useClass: PrismaServiceMock },
        { provide: TransactionMapper, useClass: TransactionMapperMock },
        {
          provide: TransactionEventProducer,
          useClass: TransactionEventProducerMock,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
