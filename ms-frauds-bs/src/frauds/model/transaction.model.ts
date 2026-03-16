import { TransactionType } from './transaction-type.model.js';
import { TransactionStatus } from './transaction-status.model.js';

export class Transaction {
  transactionExternalId: string;
  accountExternalIdDebit?: string;
  accountExternalIdCredit?: string;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  value: number;
  createdAt: Date;
  updatedAt?: Date;
}
