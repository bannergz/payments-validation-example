import { randomUUID } from 'crypto';
import { CreateTransactionInput } from '../dto/input/create.transaction.input.js';
import { Injectable } from '@nestjs/common';
import { getTransactionTypeById, TransactionType, TransactionTypeId } from '../utils/transaction-type.enum.js';
import { TransactionStatus } from '../utils/transaction-status.enum.js';
import { Transaction } from '../model/transaction.model.js';
import { TransactionEvent } from '../dto/output/transaction.event.js';
import { TransactionValidationEvent } from '../dto/output/transaction-validation.event.js';

@Injectable()
export class TransactionMapper {
  /**
   * Maps CreateTransactionInput to Transaction domain model.
   * Follows DDD by transforming input DTO to domain entity.
   */
  createTransactionToDomain(input: CreateTransactionInput): Transaction {
    // Map transferTypeId to TransactionType
    const transactionType = getTransactionTypeById(input.transferTypeId as TransactionTypeId);

    // Default status for new transactions
    const transactionStatus = TransactionStatus.Pending;

    return {
      transactionExternalId: randomUUID(), // or generate UUID if needed
      accountExternalIdDebit: input.accountExternalIdDebit,
      accountExternalIdCredit: input.accountExternalIdCredit,
      transactionType,
      transactionStatus,
      value: input.value,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Convert Prisma result to our domain Transaction model.
   */
  fromPrismaToDomain(pr: any): Transaction {
    return {
      transactionExternalId: pr.externalId,
      transactionType: {
        id: pr.transactionType.id,
        name: pr.transactionType.name,
      },
      transactionStatus: {
        id: pr.transactionStatus.id,
        name: pr.transactionStatus.name,
      },
      accountExternalIdDebit: pr.accountDebitId,
      accountExternalIdCredit: pr.accountCreditId,
      value: pr.value,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
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

  fromDomainToValidationEvent(domain: Transaction): TransactionValidationEvent {
    return new TransactionValidationEvent(this.fromDomainToEventTransaction(domain));
  }

}