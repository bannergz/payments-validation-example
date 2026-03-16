import { Test, TestingModule } from '@nestjs/testing';
import { TransactionValidationResponseConsumer } from '../../../src/transactions/event/transaction.validation.response.consumer.js';
import { TransactionService } from '../../../src/transactions/services/transaction.service.js';
import { TransactionMapper } from '../../../src/transactions/mappers/transaction.mapper.js';

// Mocks
class TransactionServiceMock {}
class TransactionMapperMock {}

describe('TransactionValidationResponseConsumer', () => {
  let consumer: TransactionValidationResponseConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionValidationResponseConsumer,
        { provide: TransactionService, useClass: TransactionServiceMock },
        { provide: TransactionMapper, useClass: TransactionMapperMock },
      ],
    }).compile();

    consumer = module.get<TransactionValidationResponseConsumer>(
      TransactionValidationResponseConsumer,
    );
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });
});
