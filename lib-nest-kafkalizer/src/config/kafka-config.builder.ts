import { KafkaConnectionConfig, KafkaConsumerConfig, KafkaProducerConfig, SchemaRegistryConfig } from "src/types/kafka.types.js";

/**
 * Helper para construir KafkaConnectionConfig desde variables de entorno
 *
 * @example
 * const kafkaConfig = KafkaConfigBuilder.fromEnv({
 *   brokers: process.env.KAFKA_BROKERS?.split(','),
 *   clientId: process.env.APP_NAME,
 * });
 */
export class KafkaConfigBuilder {
  static fromEnv(overrides?: Partial<KafkaConnectionConfig>): KafkaConnectionConfig {
    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
      .split(',')
      .map((b) => b.trim());

    return {
      brokers,
      clientId: process.env.APP_NAME || 'app',
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: process.env.KAFKA_SASL_USERNAME
        ? {
            mechanism: (process.env.KAFKA_SASL_MECHANISM as any) || 'plain',
            username: process.env.KAFKA_SASL_USERNAME,
            password: process.env.KAFKA_SASL_PASSWORD || '',
          }
        : undefined,
      ...overrides,
    };
  }

  static forProducer(
    topic: string,
    overrides?: Partial<KafkaProducerConfig>,
  ): KafkaProducerConfig {
    return {
      topic,
      compression: 2, // Snappy for better compression
      idempotent: true,
      timeout: 30000,
      ...overrides,
    };
  }

  static forConsumer(
    topic: string | string[],
    groupId: string,
    overrides?: Partial<KafkaConsumerConfig>,
  ): KafkaConsumerConfig {
    return {
      topic,
      groupId,
      fromBeginning: false,
      partitionsConsumedConcurrently: 1,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
      ...overrides,
    };
  }

  static schemaRegistry(enabled: boolean, url?: string): SchemaRegistryConfig {
    return {
      enabled,
      url: enabled ? url || process.env.SCHEMA_REGISTRY_URL : undefined,
      subject: process.env.SCHEMA_REGISTRY_SUBJECT,
    };
  }
}
