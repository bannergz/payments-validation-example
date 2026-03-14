import { Logger, ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TransactionMapper } from './mappers/transaction.mapper.js';
import { CreateTransactionInput } from './dto/input/create.transaction.input.js';
import { TransactionService } from './services/transaction.service.js';
import { Transaction } from './model/transaction.model.js';

@Resolver()
export class TransactionResolver {
  private readonly logger = new Logger(TransactionResolver.name);
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionMapper: TransactionMapper,
  ) {}

  @Mutation(() => Transaction, {
    name: 'createTransaction',
    description: 'Creates a Single transaction to be validated and processed',
  })
  createTransaction(@Args('createTransactionInput') createTransactionInput: CreateTransactionInput): Promise<Transaction> {
    const transaction = this.transactionMapper.createTransactionToDomain(createTransactionInput);
    
    return this.transactionService.createTransaction(transaction);
  }

  @Query(() => Transaction, {
    name: 'retrieveTransaction',
    description: 'Retrieves a Single transaction by its external ID',
  })
  retrieveTransaction(@Args('externalId', ParseUUIDPipe) externalId: string): Promise<Transaction> {
    return this.transactionService.retrieveTransaction(externalId);
  }
  
}
