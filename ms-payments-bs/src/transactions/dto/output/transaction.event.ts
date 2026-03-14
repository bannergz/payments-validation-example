import { TransactionStatus } from "src/transactions/model/transaction-status.model.js";
import { TransactionType } from "src/transactions/model/transaction-type.model.js";

export class TransactionEvent {
  
  transactionExternalId: string;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  value: number;
  createdAt: string;
  
}