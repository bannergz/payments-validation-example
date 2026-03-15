import { Module } from '@nestjs/common';
import { PrismaModule } from '../db/prisma.module.js';
import { TransactionResolver } from './transaction.resolver.js';
import { TransactionMapper } from './mappers/transaction.mapper.js';
import { PrismaService } from '../db/prisma.service.js';
import { TransactionService } from './services/transaction.service.js';
import { TransactionEventProducer } from './services/transaction.producer.service.js';
import { TransactionValidationResponseConsumer } from './event/transaction.validation.response.consumer.js';

@Module({
  imports: [PrismaModule],
  providers: [
    TransactionResolver,
    TransactionService,
    TransactionMapper,
    PrismaService,
    TransactionEventProducer,
    TransactionValidationResponseConsumer,
  ],
})
export class TransactionModule {}
