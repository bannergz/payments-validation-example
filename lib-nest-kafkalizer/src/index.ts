
import { Kafka, EachMessagePayload } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import dotenv from 'dotenv';
import { KafkalizerOptions, TopicConfig } from './model/kafkalizer.model.js';

dotenv.config();

export class Kafkalizer {
  kafka: Kafka;
  consumer: ReturnType<Kafka['consumer']>;
  producer: ReturnType<Kafka['producer']>;
  registry?: SchemaRegistry;
  dlqTopic?: string;
  retryAttempts?: number;
  topics: TopicConfig[];
  useSchemaRegistry?: boolean;

  constructor(options: KafkalizerOptions = {}) {
    const brokers = options.brokers || process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    const clientId = options.clientId || process.env.KAFKA_CLIENT_ID || 'kafkalizer';
    const groupId = options.groupId || process.env.KAFKA_GROUP_ID || 'kafkalizer-group';
    const schemaRegistryUrl = options.schemaRegistryUrl || process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081';
    this.dlqTopic = options.dlqTopic || process.env.DLQ_TOPIC;
    this.retryAttempts = options.retryAttempts !== undefined
      ? Number(options.retryAttempts)
      : (process.env.RETRY_ATTEMPTS !== undefined ? Number(process.env.RETRY_ATTEMPTS) : undefined);
    this.topics = options.topics || [];
    this.useSchemaRegistry = options.useSchemaRegistry ?? true;

    this.kafka = new Kafka({ brokers, clientId });
    this.consumer = this.kafka.consumer({ groupId });
    this.producer = this.kafka.producer();
    if (this.useSchemaRegistry) {
      this.registry = new SchemaRegistry({ host: schemaRegistryUrl });
    }
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
    await this.producer.connect();
    for (const topicConfig of this.topics) {
      await this.consumer.subscribe({ topic: topicConfig.topic, fromBeginning: false });
    }
    if (this.topics.length > 0) {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const topic = payload.topic;
          const config = this.topics.find((t: TopicConfig) => t.topic === topic);
          if (!config) return;
          let data: any;
          const value = payload.message.value;
          try {
            if ((config.useSchemaRegistry ?? this.useSchemaRegistry) && config.schemaId) {
              if (!this.registry) throw new Error('Schema registry not configured');
              if (value === null) throw new Error('Message value is null');
              data = await this.registry.decode(value);
            } else {
              if (value === null) throw new Error('Message value is null');
              data = JSON.parse(value.toString());
            }
          } catch (err) {
            if (this.dlqTopic) {
              await this.sendToDLQ(value, err);
            }
            return;
          }
          if (this.retryAttempts !== undefined && this.retryAttempts > 0) {
            let attempts = 0;
            let lastError: unknown = null;
            while (attempts < this.retryAttempts) {
              try {
                await config.handler(data);
                return;
              } catch (err) {
                attempts++;
                lastError = err;
              }
            }
            if (this.dlqTopic) {
              await this.sendToDLQ(value, lastError);
            }
          } else {
            // Sin retries, solo ejecutar handler una vez
            try {
              await config.handler(data);
            } catch (err) {
              if (this.dlqTopic) {
                await this.sendToDLQ(value, err);
              }
            }
          }
        },
      });
    }
  }

  async sendToDLQ(message: Buffer | null, error: unknown): Promise<void> {
    if (!this.dlqTopic) return;
    await this.producer.send({
      topic: this.dlqTopic,
      messages: [
        {
          value: JSON.stringify({
            originalMessage: message?.toString(),
            error: (error instanceof Error) ? error.message : String(error),
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
  }

  async produce(topic: string, message: any, schemaId?: number, useSchemaRegistry?: boolean): Promise<void> {
    let value: Buffer;
    if ((useSchemaRegistry ?? this.useSchemaRegistry) && schemaId) {
      if (!this.registry) throw new Error('Schema registry not configured');
      value = await this.registry.encode(schemaId, message);
    } else {
      value = Buffer.from(JSON.stringify(message));
    }
    await this.producer.send({ topic, messages: [{ value }] });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }
}
