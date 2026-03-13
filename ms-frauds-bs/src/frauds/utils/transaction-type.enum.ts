import { BadRequestException } from '@nestjs/common';

export const TransactionType = {
  Payment: { id: 1, name: 'Payment' },
  Remittance: { id: 2, name: 'Remittance' },
  Refund: { id: 3, name: 'Refund' },
} as const;

export type TransactionTypeKey = keyof typeof TransactionType;
export type TransactionTypeValue = (typeof TransactionType)[TransactionTypeKey];
export type TransactionTypeId = TransactionTypeValue['id']; // 1 | 2 | 3

export function getTransactionTypeById(id: TransactionTypeId): TransactionTypeValue {
  const type = Object.values(TransactionType).find(t => t.id === id);
  if (!type) {
    throw new BadRequestException(`Invalid transaction type id: ${id}`);
  }
  return type;
}
