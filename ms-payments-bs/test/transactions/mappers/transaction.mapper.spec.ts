import { TransactionMapper } from '../../../src/transactions/mappers/transaction.mapper.js';
import { Transaction } from '../../../src/transactions/model/transaction.model.js';

describe('TransactionMapper', () => {
  let mapper: TransactionMapper;

  beforeEach(() => {
    mapper = new TransactionMapper();
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
