import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service.js';
import { PrismaService } from '../../db/prisma.service.js';
import { TransactionMapper } from '../mappers/transaction.mapper.js';
import { TransactionEventProducer } from './transaction.producer.service.js';

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
        { provide: TransactionEventProducer, useClass: TransactionEventProducerMock },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
