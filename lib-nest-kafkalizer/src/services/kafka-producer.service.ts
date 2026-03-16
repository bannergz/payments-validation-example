import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, IHeaders } from 'kafkajs';
import { SchemaRegistryService } from './schema-registry.service.js';
import type { KafkaConnectionConfig, KafkaProducerConfig, PublishOptions, PublishResult } from 'src/types/kafka.types.js';

/**
 * Servicio genérico para publicar mensajes en Kafka
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer | null = null;
  private kafka: Kafka | null = null;
  private logger = new Logger(KafkaProducerService.name);

  constructor(
    private readonly schemaRegistryService: SchemaRegistryService,
    private readonly kafkaConfig: KafkaConnectionConfig,
    private readonly producerConfig: KafkaProducerConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Conecta el producer
   */
  async connect(): Promise<void> {
    try {
      this.kafka = new Kafka({
        clientId: this.kafkaConfig.clientId,
        brokers: this.kafkaConfig.brokers,
        ...(this.kafkaConfig.ssl && { ssl: true }),
        ...(this.kafkaConfig.sasl && { sasl: this.kafkaConfig.sasl }),
      });

      this.producer = this.kafka.producer({
        idempotent: this.producerConfig.idempotent,
        ...(this.producerConfig.compression && { compression: this.producerConfig.compression }),
      });

      await this.producer.connect();
      this.logger.log(
        `Producer connected to topic: ${this.producerConfig.topic}`,
      );
    } catch (error) {
      this.logger.error('Failed to connect producer', error);
      throw error;
    }
  }

  /**
   * Desconecta el producer
   */
  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Producer disconnected');
    }
  }

  /**
   * Publica un mensaje en el tópico configurado
   */
  async publish<T>(
    value: T,
    options: PublishOptions = {},
  ): Promise<PublishResult[]> {
    if (!this.producer) {
      throw new Error('Producer is not connected');
    }

    try {
      const message = await this.buildMessage(value, options);

      const records = await this.producer.send({
        topic: this.producerConfig.topic,
        messages: [message],
        timeout: this.producerConfig.timeout || 10000,
      });

      return records.map((record) => ({
        partition: record.partition,
        offset: record.offset || '0',
        timestamp: record.timestamp || new Date().toISOString(),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to publish message to ${this.producerConfig.topic}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publica múltiples mensajes en batch
   */
  async publishBatch<T>(
    values: T[],
    baseOptions: PublishOptions = {},
  ): Promise<PublishResult[]> {
    if (!this.producer) {
      throw new Error('Producer is not connected');
    }

    try {
      const messages = await Promise.all(
        values.map((value) => this.buildMessage(value, baseOptions)),
      );

      const records = await this.producer.send({
        topic: this.producerConfig.topic,
        messages,
        timeout: this.producerConfig.timeout || 10000,
      });

      return records.map((record) => ({
        partition: record.partition,
        offset: record.offset || '0',
        timestamp: record.timestamp || new Date().toISOString(),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to publish batch to ${this.producerConfig.topic}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Construye un mensaje de Kafka
   */
  private async buildMessage(
    value: unknown,
    options: PublishOptions,
  ): Promise<any> {
    const headers = this.buildHeaders(options.headers);
    let messageValue: Buffer | string;

    if (this.schemaRegistryService.isEnabled()) {
      const config = this.schemaRegistryService.getConfig();
      const schemaId = await this.schemaRegistryService.getLatestSchemaId(
        config?.subject!,
      );
      messageValue = await this.schemaRegistryService.encode(
        schemaId,
        value,
      );
    } else {
      messageValue = JSON.stringify(value);
    }

    return {
      key: options.key,
      value: messageValue,
      headers,
      partition: options.partition,
      timestamp: options.timestamp ? options.timestamp.toString() : undefined,
    };
  }

  /**
   * Construye los headers del mensaje
   */
  private buildHeaders(customHeaders?: Record<string, string>): IHeaders {
    const headers: IHeaders = {
      'X-Service-Name': this.kafkaConfig.clientId,
      'X-Publish-Timestamp': new Date().toISOString(),
    };

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Obtiene el producer (para casos avanzados)
   */
  getProducer(): Producer | null {
    return this.producer;
  }

  /**
   * Verifica si el producer está conectado
   */
  isConnected(): boolean {
    return this.producer !== null;
  }
}
