import { TransactionRequestConsumer } from '../../src/frauds/event/transaction.request.consumer.js';
import { FraudsValidationService } from '../../src/frauds/services/frauds.validation.service.js';
import { TransactionMapper } from '../../src/frauds/mappers/transaction.mapper.js';
import * as jest from 'jest-mock';

describe('TransactionRequestConsumer', () => {
  let consumer: TransactionRequestConsumer;
  let fraudsValidationService: FraudsValidationService;
  let transactionMapper: TransactionMapper;

  beforeEach(() => {
    fraudsValidationService = {
      validateTransaction: jest.fn(),
    } as unknown as FraudsValidationService;
    transactionMapper = new TransactionMapper();
    consumer = new TransactionRequestConsumer(
      fraudsValidationService,
      transactionMapper,
    );
    consumer['consumer'] = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    } as unknown as (typeof consumer)['consumer'];
  });

  it('should connect and subscribe to topic', async () => {
    await expect(consumer.start()).resolves.not.toThrow();
    expect(
      (consumer['consumer'].connect as jest.Mock).mock.calls.length,
    ).toBeGreaterThan(0);
    expect(
      (consumer['consumer'].subscribe as jest.Mock).mock.calls.length,
    ).toBeGreaterThan(0);
    expect(
      (consumer['consumer'].run as jest.Mock).mock.calls.length,
    ).toBeGreaterThan(0);
  });
});
