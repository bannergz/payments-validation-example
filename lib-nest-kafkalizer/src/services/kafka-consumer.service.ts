import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import {
  KafkaConnectionConfig,
  KafkaConsumerConfig,
  KafkaMessage,
} from '../types';
import { SchemaRegistryService } from './schema-registry.service';

/**
 * Handler para procesar mensajes del consumer
 */
export type MessageHandler<T = unknown> = (message: KafkaMessage<T>) => Promise<void>;

/**
 * Servicio genérico para consumir mensajes de Kafka
 */
@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer | null = null;
  private kafka: Kafka | null = null;
  private logger = new Logger(KafkaConsumerService.name);
  private messageHandler: MessageHandler | null = null;

  constructor(
    private readonly schemaRegistryService: SchemaRegistryService,
    private readonly kafkaConfig: KafkaConnectionConfig,
    private readonly consumerConfig: KafkaConsumerConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Conecta el consumer
   */
  async connect(): Promise<void> {
    try {
      this.kafka = new Kafka({
        clientId: this.kafkaConfig.clientId,
        brokers: this.kafkaConfig.brokers,
        ...(this.kafkaConfig.ssl && { ssl: true }),
        ...(this.kafkaConfig.sasl && { sasl: this.kafkaConfig.sasl }),
      });

      this.consumer = this.kafka.consumer({
        groupId: this.consumerConfig.groupId,
        sessionTimeout: this.consumerConfig.sessionTimeout,
        heartbeatInterval: this.consumerConfig.heartbeatInterval,
      });

      await this.consumer.connect();

      const topics = Array.isArray(this.consumerConfig.topic)
        ? this.consumerConfig.topic
        : [this.consumerConfig.topic];

      await this.consumer.subscribe({
        topics,
        fromBeginning: this.consumerConfig.fromBeginning ?? false,
      });

      await this.consumer.run({
        partitionsConsumedConcurrently:
          this.consumerConfig.partitionsConsumedConcurrently ?? 1,
        eachMessage: (payload) => this.handleMessage(payload),
      });

      this.logger.log(
        `Consumer connected to topics: ${topics.join(', ')} with group: ${this.consumerConfig.groupId}`,
      );
    } catch (error) {
      this.logger.error('Failed to connect consumer', error);
      throw error;
    }
  }

  /**
   * Desconecta el consumer
   */
  async disconnect(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.logger.log('Consumer disconnected');
    }
  }

  /**
   * Registra un handler para procesar mensajes
   */
  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  /**
   * Maneja un mensaje recibido
   */
  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const { topic, partition, message } = payload;

      let value: unknown;

      if (this.schemaRegistryService.isEnabled() && message.value) {
        value = await this.schemaRegistryService.decode(message.value);
      } else if (message.value) {
        value = JSON.parse(message.value.toString());
      }

      const kafkaMessage: KafkaMessage = {
        key: message.key?.toString() || '',
        value,
        headers: message.headers,
        partition,
        offset: message.offset,
        timestamp: message.timestamp,
      };

      if (this.messageHandler) {
        await this.messageHandler(kafkaMessage);
      }

      this.logger.debug(
        `Message processed from ${topic}:${partition}@${message.offset}`,
      );
    } catch (error) {
      this.logger.error('Error processing message', error);
      throw error;
    }
  }

  /**
   * Obtiene el consumer (para casos avanzados)
   */
  getConsumer(): Consumer | null {
    return this.consumer;
  }

  /**
   * Verifica si el consumer está conectado
   */
  isConnected(): boolean {
    return this.consumer !== null;
  }
}
