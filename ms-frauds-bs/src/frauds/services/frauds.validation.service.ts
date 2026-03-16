import { Injectable } from '@nestjs/common';
import { Transaction } from '../model/transaction.model.js';
import { TransactionStatus } from '../utils/transaction-status.enum.js';
import { TransactionEventProducer } from './transaction.producer.service.js';
import { TransactionMapper } from '../mappers/transaction.mapper.js';

@Injectable()
export class FraudsValidationService {
  constructor(
    private readonly eventProducer: TransactionEventProducer,
    private readonly transactionMapper: TransactionMapper,
  ) {}

  async validateTransaction(transaction: Transaction): Promise<void> {
    if (transaction.value > 1000) {
      transaction.transactionStatus = { ...TransactionStatus.Rejected };
    } else {
      transaction.transactionStatus = { ...TransactionStatus.Approved };
    }

    try {
      await this.eventProducer.publishTransactionValidationResponse(
        this.transactionMapper.fromDomainToValidationEvent(transaction),
      );
    } catch (error) {
      // Log error but don't fail the transaction creation
      console.error('Failed to publish transaction validation event:', error);
    }
  }
}
