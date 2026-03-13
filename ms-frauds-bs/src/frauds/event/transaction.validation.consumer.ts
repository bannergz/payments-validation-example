import { Consumer, Kafka } from 'kafkajs';
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { kafkaConfig } from '../config/kafka.config.js';
import { FraudsValidationService } from '../services/frauds.validation.service.js';
import { TransactionValidationRequestEvent } from '../dto/input/transaction-validation-request.event.js';
import { TransactionMapper } from '../mappers/transaction.mapper.js';

@Injectable()
export class TransactionValidationConsumer implements OnModuleInit {
  private KafkaClient: Kafka;
  private consumer: Consumer;
  private topic: string;
  private schemaRegistry: SchemaRegistry;
  private readonly logger = new Logger(TransactionValidationConsumer.name);

  constructor(
    private readonly fraudsValidationService: FraudsValidationService,
    private readonly transactionMapper: TransactionMapper) {
    this.KafkaClient = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });
    this.consumer = this.KafkaClient.consumer({ groupId: kafkaConfig.fraudsConsumerGroupId });
    this.topic = kafkaConfig.transactionValidationRequestTopic;
    this.schemaRegistry = new SchemaRegistry({ host: kafkaConfig.schemaRegistryUrl });
  }

  async onModuleInit() {
    await this.start();
  }

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });
    this.logger.log(`Subscribed to topic: ${this.topic}`);

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) {
            this.logger.warn('Received message with empty value');
            return;
          }

          const eventData = await this.schemaRegistry.decode(message.value);
          const validationEvent = eventData as TransactionValidationRequestEvent;

          this.logger.log(`Received event: ${JSON.stringify(validationEvent)}`);
          await this.fraudsValidationService
            .validateTransaction(this.transactionMapper.fromEventToDomain(validationEvent.transaction));
        } catch (err) {
          this.logger.error('Error processing message', err);
        }
      },
    });
  }
}