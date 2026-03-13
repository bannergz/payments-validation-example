export const TransactionStatus = {
  Pending: { id: 1, name: 'Pending' },
  Approved: { id: 2, name: 'Approved' },
  Rejected: { id: 3, name: 'Rejected' },
} as const;

export type TransactionStatusKey = keyof typeof TransactionStatus;
export type TransactionStatusValue = typeof TransactionStatus[TransactionStatusKey];
