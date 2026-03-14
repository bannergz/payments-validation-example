import { TransactionEvent } from "./transaction.event.js";

export class TransactionValidationEvent {
  eventId: string; // UUID
  eventTimestamp: Date; // ISO 8601
  eventType: 'TRANSACTION_CREATED' = 'TRANSACTION_CREATED';
  transaction: TransactionEvent;

  constructor(transactionEvent: TransactionEvent) {
    this.eventId = crypto.randomUUID();
    this.eventTimestamp = new Date();
    this.transaction = transactionEvent;
  }

  toJSON() {
    return {
      eventId: this.eventId,
      eventTimestamp: this.eventTimestamp.toISOString(),
      eventType: this.eventType,
      transaction: this.transaction,
    };
  }
}
