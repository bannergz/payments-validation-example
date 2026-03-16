import { TransactionMapper } from '../../src/frauds/mappers/transaction.mapper.js';
import { Transaction } from '../../src/frauds/model/transaction.model.js';
import { TransactionEvent } from '../../src/frauds/dto/input/transaction.event.js';

describe('TransactionMapper', () => {
  let mapper: TransactionMapper;

  beforeEach(() => {
    mapper = new TransactionMapper();
  });

  it('should map from event to domain', () => {
    const event: TransactionEvent = {
      transactionExternalId: 'id',
      transactionType: { id: 1, name: 'Payment' },
      transactionStatus: { id: 1, name: 'Pending' },
      value: 100,
      createdAt: new Date().toISOString(),
    };
    const domain = mapper.fromEventToDomain(event);
    expect(domain.transactionExternalId).toBe(event.transactionExternalId);
    expect(domain.value).toBe(event.value);
    expect(domain.transactionType).toEqual(event.transactionType);
    expect(domain.transactionStatus).toEqual(event.transactionStatus);
    expect(domain.createdAt).toBeInstanceOf(Date);
  });

  it('should map from domain to event', () => {
    const domain: Transaction = {
      transactionExternalId: 'id',
      transactionType: { id: 1, name: 'Payment' },
      transactionStatus: { id: 1, name: 'Pending' },
      value: 100,
      createdAt: new Date(),
    } as Transaction;
    const event = mapper.fromDomainToEventTransaction(domain);
    expect(event.transactionExternalId).toBe(domain.transactionExternalId);
    expect(event.value).toBe(domain.value);
    expect(event.transactionType).toEqual(domain.transactionType);
    expect(event.transactionStatus).toEqual(domain.transactionStatus);
    expect(typeof event.createdAt).toBe('string');
  });
});
