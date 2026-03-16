import { IHeaders, ProducerRecord } from 'kafkajs';

/**
 * Configuración base de Kafka
 */
export interface KafkaConnectionConfig {
  brokers: string[];
  clientId: string;
  ssl?: boolean;
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
}

/**
 * Configuración de Schema Registry (opcional)
 */
export interface SchemaRegistryConfig {
  enabled: boolean;
  url?: string;
  /**
   * Subject para el esquema (ej: 'transaction-validation-request-schema')
   */
  subject?: string;
}

/**
 * Configuración para un producer
 */
export interface KafkaProducerConfig {
  topic: string;
  compression?: 0 | 1 | 2 | 3; // 0=None, 1=GZIP, 2=Snappy, 3=LZ4
  timeout?: number;
  requestSize?: number;
  idempotent?: boolean;
}

/**
 * Configuración para un consumer
 */
export interface KafkaConsumerConfig {
  topic: string | string[];
  groupId: string;
  fromBeginning?: boolean;
  partitionsConsumedConcurrently?: number;
  eachMessage?: (payload: any) => Promise<void>;
  sessionTimeout?: number;
  heartbeatInterval?: number;
}

/**
 * Mensaje de Kafka con metadatos
 */
export interface KafkaMessage<T = unknown> {
  key: string;
  value: T;
  headers?: IHeaders;
  partition: number;
  offset: string;
  timestamp: string;
}

/**
 * Opciones para publicar un mensaje
 */
export interface PublishOptions {
  key?: string;
  headers?: Record<string, string>;
  partition?: number;
  timestamp?: number;
}

/**
 * Resultado de la publicación
 */
export interface PublishResult {
  partition: number;
  offset: string;
  timestamp: string;
}

/**
 * Opciones de reconexión
 */
export interface RetryOptions {
  maxRetries?: number;
  initialRetryTime?: number;
  retries?: number;
  factor?: number;
}

/**
 * Evento de Kafka con información de correlación
 */
export interface KafkaEvent<T = unknown> {
  eventId: string;
  eventTimestamp: number;
  eventType: string;
  data: T;
}

/**
 * Metadata de mensaje
 */
export interface MessageMetadata {
  correlationId?: string;
  traceId?: string;
  timestamp: number;
  source?: string;
}
