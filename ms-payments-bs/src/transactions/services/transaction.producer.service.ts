import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { TransactionValidationEvent } from '../dto/output/transaction-validation.event.js';
import { kafkaConfig } from '../config/kafka.config.js';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

@Injectable()
export class TransactionEventProducer {
  private kafka: Kafka;
  private producer: Producer;
  private topic: string;
  private schemaRegistry: SchemaRegistry;
  private schemaSubject: string;
  private readonly logger = new Logger(TransactionEventProducer.name);

  constructor() {
    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });
    this.producer = this.kafka.producer();
    this.topic = kafkaConfig.transactionValidationRequestTopic;
    this.schemaRegistry = new SchemaRegistry({
      host: kafkaConfig.schemaRegistryUrl,
    });
    this.schemaSubject = kafkaConfig.transactionValidationSubject;
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async publishTransactionValidationRequest(
    event: TransactionValidationEvent,
  ): Promise<void> {
    try {
      // Usa el subject exactamente como está registrado en el Schema Registry
      const subject = this.schemaSubject;
      let id: number;
      try {
        id = await this.schemaRegistry.getLatestSchemaId(subject);
      } catch (err) {
        this.logger.error(
          `Schema subject '${subject}' not found in registry.`,
          err,
        );
        throw err;
      }

      // Log del objeto a enviar para comparar con el schema
      const payload = event.toJSON();

      // Serializa el mensaje usando el schema del registry
      const value = await this.schemaRegistry.encode(id, payload);

      const message = {
        key: event.transaction.transactionExternalId,
        value,
        headers: {
          'correlation-id': event.eventId,
          timestamp: Date.now().toString(),
        },
      };

      const result = await this.producer.send({
        topic: this.topic,
        messages: [message],
      });

      this.logger.log(
        `Transaction validation request published: ${event.transaction.transactionExternalId}`,
      );
      this.logger.debug(`Kafka result: ${JSON.stringify(result)}`);
    } catch (error: unknown) {
      let errorMsg = 'Unknown error';
      if (isErrorWithMessage(error)) {
        errorMsg = error.message;
      }
      this.logger.error(
        `Failed to publish transaction validation request: ${errorMsg}`,
        error,
      );
      throw error;
    }

    // Helper type guard
    function isErrorWithMessage(err: unknown): err is { message: string } {
      return (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      );
    }
  }
}
