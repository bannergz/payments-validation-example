import { TransactionEventProducer } from '../../src/frauds/services/transaction.producer.service.js';
import * as jest from 'jest-mock';

describe('TransactionEventProducer', () => {
  let producer: TransactionEventProducer;

  beforeEach(() => {
    producer = new TransactionEventProducer();
    producer['producer'] = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
    } as unknown as (typeof producer)['producer'];
  });

  it('should connect and disconnect producer', async () => {
    await expect(producer.onModuleInit()).resolves.not.toThrow();
    await expect(producer.onModuleDestroy()).resolves.not.toThrow();
  });

  it('should log error if connect fails', async () => {
    producer['producer'].connect = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'));
    await expect(producer.onModuleInit()).rejects.toThrow('fail');
  });
});
