import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { Transaction } from '../model/transaction.model.js';
import { TransactionEvent } from '../dto/input/transaction.event.js';
import { TransactionValidationRequestEvent } from '../dto/input/transaction-validation-request.event.js';

@Injectable()
export class TransactionMapper {

  

  fromEventToDomain(event: TransactionEvent): Transaction {
    return {
      transactionExternalId: event.transactionExternalId,
      transactionType: event.transactionType,
      transactionStatus: event.transactionStatus,
      value: event.value,
      createdAt: new Date(event.createdAt),
    };
  }

  fromDomainToEventTransaction(domain: Transaction): TransactionEvent {
    return {
      transactionExternalId: domain.transactionExternalId,
      transactionType: domain.transactionType,
      transactionStatus: domain.transactionStatus,
      value: domain.value,
      createdAt: domain.createdAt.toISOString(),
    };

  }

  fromDomainToValidationEvent(domain: Transaction): TransactionValidationRequestEvent {
    return new TransactionValidationRequestEvent(this.fromDomainToEventTransaction(domain));
  }

}