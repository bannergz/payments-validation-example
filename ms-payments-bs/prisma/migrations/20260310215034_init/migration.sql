-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "externalId" UUID NOT NULL,
    "transactionTypeId" INTEGER NOT NULL,
    "transactionStatusId" INTEGER NOT NULL,
    "accountDebitId" UUID NOT NULL,
    "accountCreditId" UUID NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TransactionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TransactionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_externalId_key" ON "Transaction"("externalId");

-- CreateIndex
CREATE INDEX "Transaction_externalId_idx" ON "Transaction"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionType_name_key" ON "TransactionType"("name");

-- CreateIndex
CREATE INDEX "TransactionType_name_idx" ON "TransactionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionStatus_name_key" ON "TransactionStatus"("name");

-- CreateIndex
CREATE INDEX "TransactionStatus_name_idx" ON "TransactionStatus"("name");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transactionStatusId_fkey" FOREIGN KEY ("transactionStatusId") REFERENCES "TransactionStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transactionTypeId_fkey" FOREIGN KEY ("transactionTypeId") REFERENCES "TransactionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
