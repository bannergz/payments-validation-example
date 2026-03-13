import { Module } from "@nestjs/common";
import { FraudsValidationService } from "./services/frauds.validation.service.js";
import { TransactionEventProducer } from "./services/transaction.producer.service.js";
import { TransactionMapper } from "./mappers/transaction.mapper.js";
import { TransactionRequestConsumer } from "./event/transaction.request.consumer.js";

@Module({
  imports: [],
  providers: [TransactionRequestConsumer, TransactionMapper, TransactionEventProducer, FraudsValidationService],
})
export class FraudsModule {}