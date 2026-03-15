import { Injectable, Logger } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { TransactionService } from '../services/transaction.service.js';
import { kafkaConfig } from '../config/kafka.config.js';
import { TransactionValidationEvent } from '../dto/output/transaction-validation.event.js';

@Injectable()
export class TransactionValidationResponseConsumer {
  private kafkaClient: Kafka;
  private consumer: Consumer;
  private topic: string;
  private schemaRegistry: SchemaRegistry;

  private readonly logger = new Logger(
    TransactionValidationResponseConsumer.name,
  );

  constructor(private readonly transactionService: TransactionService) {
    this.kafkaClient = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });
    this.consumer = this.kafkaClient.consumer({
      groupId: kafkaConfig.paymentsConsumerGroupId,
    });
    this.topic = kafkaConfig.transactionValidationResponseTopic;
    this.schemaRegistry = new SchemaRegistry({
      host: kafkaConfig.schemaRegistryUrl,
    });
  }

  async onModuleInit() {
    await this.start();
  }

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });
    this.logger.log(`Subscribed to topic: ${this.topic}`);

    await this.consumer.run({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) {
            this.logger.warn('Received message with empty value');
            return;
          }

          const eventData = (await this.schemaRegistry.decode(
            message.value,
          )) as TransactionValidationEvent;
          const transaction = eventData.transaction;

          this.logger.log(`Received event: ${JSON.stringify(eventData)}`);
          await this.transactionService.updateTransaction(
            transaction.transactionExternalId,
            transaction.transactionStatus,
          );
        } catch (err) {
          this.logger.error('Error processing message', err);
        }
      },
    });
  }
}
