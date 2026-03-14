import { Field, ObjectType } from '@nestjs/graphql';
import { TransactionType } from './transaction-type.model.js';
import { TransactionStatus } from './transaction-status.model.js';
import { IsUUID } from 'class-validator';
import { UUID_VERSION } from '../../commons/constants.js';

@ObjectType({ description: 'Transaction' })
export class Transaction {

  @Field({ description: 'Transaction External ID' })
  @IsUUID(UUID_VERSION, { message: 'transactionExternalId must be a valid UUID' })
  transactionExternalId: string;

  @Field({ description: 'Account External ID for Debit' })
  @IsUUID(UUID_VERSION, { message: 'accountExternalIdDebit must be a valid UUID' })
  accountExternalIdDebit: string;

  @Field({ description: 'Account External ID for Credit' })
  @IsUUID(UUID_VERSION, { message: 'accountExternalIdCredit must be a valid UUID' })
  accountExternalIdCredit: string;

  @Field({ description: 'Transaction Type' })
  transactionType: TransactionType;

  @Field({ description: 'Transaction Status' })
  transactionStatus: TransactionStatus;

  @Field({ description: 'Transaction Value' })
  value: number;

  @Field({ description: 'Transaction Created At' })
  createdAt: Date;

  @Field({ description: 'Transaction Updated At' })
  updatedAt: Date;

}