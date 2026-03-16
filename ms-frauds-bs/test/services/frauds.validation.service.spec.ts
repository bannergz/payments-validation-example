import { FraudsValidationService } from '../../src/frauds/services/frauds.validation.service.js';
import { TransactionEventProducer } from '../../src/frauds/services/transaction.producer.service.js';
import { TransactionMapper } from '../../src/frauds/mappers/transaction.mapper.js';
import { Transaction } from '../../src/frauds/model/transaction.model.js';
import { TransactionStatus } from '../../src/frauds/utils/transaction-status.enum.js';
import * as jest from 'jest-mock';

describe('FraudsValidationService', () => {
  let service: FraudsValidationService;
  let eventProducer: {
    publishTransactionValidationResponse: jest.MockedFunction<
      (event: any) => Promise<void>
    >;
  };
  let transactionMapper: TransactionMapper;

  beforeEach(() => {
    eventProducer = {
      publishTransactionValidationResponse:
        jest.fn<(event: any) => Promise<void>>(),
    };
    transactionMapper = new TransactionMapper();
    service = new FraudsValidationService(
      eventProducer as unknown as TransactionEventProducer,
      transactionMapper,
    );
  });

  it('should approve transaction with value <= 1000', async () => {
    const transaction = { value: 500, createdAt: new Date() } as Transaction;
    await service.validateTransaction(transaction);
    expect(transaction.transactionStatus).toEqual(TransactionStatus.Approved);
    expect(
      eventProducer.publishTransactionValidationResponse,
    ).toHaveBeenCalled();
  });

  it('should reject transaction with value > 1000', async () => {
    const transaction = { value: 1500, createdAt: new Date() } as Transaction;
    await service.validateTransaction(transaction);
    expect(transaction.transactionStatus).toEqual(TransactionStatus.Rejected);
    expect(
      eventProducer.publishTransactionValidationResponse,
    ).toHaveBeenCalled();
  });

  it('should handle errors in event publishing gracefully', async () => {
    eventProducer.publishTransactionValidationResponse.mockRejectedValueOnce(
      new Error('fail'),
    );
    const transaction = { value: 500, createdAt: new Date() } as Transaction;
    await expect(
      service.validateTransaction(transaction),
    ).resolves.not.toThrow();
  });
});
