export type PrismaTransactionResult = {
  externalId: string;
  transactionType: { id: number | string; name: string };
  transactionStatus: { id: number | string; name: string };
  accountDebitId: string;
  accountCreditId: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
};
