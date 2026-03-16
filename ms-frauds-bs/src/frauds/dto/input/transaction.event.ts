import { TransactionStatus } from 'src/frauds/model/transaction-status.model.js';
import { TransactionType } from 'src/frauds/model/transaction-type.model.js';

export class TransactionEvent {
  transactionExternalId: string;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  value: number;
  createdAt: string;
}
