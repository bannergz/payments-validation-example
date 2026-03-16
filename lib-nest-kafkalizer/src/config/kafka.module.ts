import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KafkaConnectionConfig,
  KafkaProducerConfig,
  KafkaConsumerConfig,
  SchemaRegistryConfig,
} from '../types';
import {
  SchemaRegistryService,
  KafkaProducerService,
  KafkaConsumerService,
} from '../services';

export interface KafkaModuleOptions {
  kafkaConfig: KafkaConnectionConfig;
  schemaRegistryConfig: SchemaRegistryConfig;
  producerConfig?: KafkaProducerConfig;
  consumerConfig?: KafkaConsumerConfig;
}

export interface AsyncKafkaModuleOptions {
  useFactory: (
    configService: ConfigService,
  ) => Promise<KafkaModuleOptions> | KafkaModuleOptions;
  inject?: any[];
}

@Module({})
export class KafkaModule {
  /**
   * Registro sincrónico del módulo
   */
  static register(options: KafkaModuleOptions): DynamicModule {
    const schemaRegistryProvider: Provider = {
      provide: SchemaRegistryService,
      useFactory: async (schemaRegistryService: SchemaRegistryService) => {
        await schemaRegistryService.initialize(
          options.schemaRegistryConfig,
        );
        return schemaRegistryService;
      },
      inject: [SchemaRegistryService],
    };

    const producerProvider: Provider | null = options.producerConfig
      ? {
          provide: KafkaProducerService,
          useFactory: (schemaRegistryService: SchemaRegistryService) => {
            return new KafkaProducerService(
              schemaRegistryService,
              options.kafkaConfig,
              options.producerConfig!,
              options.schemaRegistryConfig,
            );
          },
          inject: [SchemaRegistryService],
        }
      : null;

    const consumerProvider: Provider | null = options.consumerConfig
      ? {
          provide: KafkaConsumerService,
          useFactory: (schemaRegistryService: SchemaRegistryService) => {
            return new KafkaConsumerService(
              schemaRegistryService,
              options.kafkaConfig,
              options.consumerConfig!,
              options.schemaRegistryConfig,
            );
          },
          inject: [SchemaRegistryService],
        }
      : null;

    const providers: Provider[] = [
      SchemaRegistryService,
      schemaRegistryProvider,
    ];

    if (producerProvider) {
      providers.push(producerProvider);
    }

    if (consumerProvider) {
      providers.push(consumerProvider);
    }

    return {
      module: KafkaModule,
      providers,
      exports: providers,
    };
  }

  /**
   * Registro asincrónico del módulo (para usar con ConfigService)
   */
  static registerAsync(options: AsyncKafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: options.inject ? [] : [],
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: SchemaRegistryService,
          useFactory: async (kafkaOptions: KafkaModuleOptions) => {
            const schemaRegistryService = new SchemaRegistryService();
            await schemaRegistryService.initialize(
              kafkaOptions.schemaRegistryConfig,
            );
            return schemaRegistryService;
          },
          inject: ['KAFKA_OPTIONS'],
        },
        {
          provide: KafkaProducerService,
          useFactory: (
            kafkaOptions: KafkaModuleOptions,
            schemaRegistryService: SchemaRegistryService,
          ) => {
            if (!kafkaOptions.producerConfig) {
              return null;
            }
            return new KafkaProducerService(
              schemaRegistryService,
              kafkaOptions.kafkaConfig,
              kafkaOptions.producerConfig,
              kafkaOptions.schemaRegistryConfig,
            );
          },
          inject: ['KAFKA_OPTIONS', SchemaRegistryService],
        },
        {
          provide: KafkaConsumerService,
          useFactory: (
            kafkaOptions: KafkaModuleOptions,
            schemaRegistryService: SchemaRegistryService,
          ) => {
            if (!kafkaOptions.consumerConfig) {
              return null;
            }
            return new KafkaConsumerService(
              schemaRegistryService,
              kafkaOptions.kafkaConfig,
              kafkaOptions.consumerConfig,
              kafkaOptions.schemaRegistryConfig,
            );
          },
          inject: ['KAFKA_OPTIONS', SchemaRegistryService],
        },
      ],
      exports: [
        SchemaRegistryService,
        KafkaProducerService,
        KafkaConsumerService,
      ],
    };
  }
}
