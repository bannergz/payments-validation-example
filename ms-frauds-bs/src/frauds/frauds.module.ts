import { Module } from "@nestjs/common";
import { TransactionValidationConsumer } from "./event/transaction.validation.consumer.js";
import { FraudsValidationService } from "./services/frauds.validation.service.js";
import { TransactionEventProducer } from "./services/transaction.producer.service.js";
import { TransactionMapper } from "./mappers/transaction.mapper.js";

@Module({
  imports: [],
  providers: [TransactionValidationConsumer, TransactionMapper, TransactionEventProducer, FraudsValidationService],
})
export class FraudsModule {}