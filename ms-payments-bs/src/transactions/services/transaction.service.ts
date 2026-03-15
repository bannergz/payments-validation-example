import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service.js';
import { TransactionEventProducer } from './transaction.producer.service.js';
import { TransactionMapper } from '../mappers/transaction.mapper.js';
import { Transaction } from '../model/transaction.model.js';
import { TransactionStatus } from '../model/transaction-status.model.js';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mapper: TransactionMapper,
    private readonly eventProducer: TransactionEventProducer,
  ) {}

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    const response = await this.prismaService.transaction.create({
      data: {
        value: transaction.value,
        transactionType: {
          connect: {
            name: transaction.transactionType.name,
          },
        },
        transactionStatus: {
          connect: {
            name: transaction.transactionStatus.name,
            //create: { name: transaction.transactionStatus.name },
          },
        },
        accountDebitId: transaction.accountExternalIdDebit,
        accountCreditId: transaction.accountExternalIdCredit,
        updatedAt: transaction.updatedAt,
      },
      include: {
        transactionType: true,
        transactionStatus: true,
      },
    });

    const domainTransaction = this.mapper.fromPrismaToDomain(response);

    // Publish validation event to Kafka
    try {
      await this.eventProducer.publishTransactionValidationRequest(
        this.mapper.fromDomainToValidationEvent(domainTransaction),
      );
    } catch (error) {
      // Log error but don't fail the transaction creation
      console.error('Failed to publish transaction validation event:', error);
    }

    return domainTransaction;
  }

  async retrieveTransaction(externalId: string): Promise<Transaction> {
    const response = await this.prismaService.transaction.findUnique({
      where: { externalId: externalId },
      include: {
        transactionType: true,
        transactionStatus: true,
      },
    });

    if (!response) {
      throw new NotFoundException(
        `Transaction with externalId "${externalId}" not found`,
      );
    }

    return this.mapper.fromPrismaToDomain(response);
  }

  async updateTransaction(
    externalId: string,
    transactionStatus: TransactionStatus,
  ): Promise<any> {
    const response = await this.prismaService.transaction.update({
      where: { externalId },
      data: {
        transactionStatus: {
          connect: {
            name: transactionStatus.name,
          },
        },
        updatedAt: new Date(),
      },
      include: {
        transactionStatus: true,
      },
    });

    return response;
  }
}
