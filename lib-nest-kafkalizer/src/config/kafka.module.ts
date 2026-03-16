import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KafkaConnectionConfig,
  KafkaProducerConfig,
  KafkaConsumerConfig,
  SchemaRegistryConfig,
  NamedProducerConfig,
  NamedConsumerConfig,
} from '../types';
import {
  SchemaRegistryService,
  KafkaProducerService,
  KafkaConsumerService,
  KafkaServiceRegistry,
} from '../services';

export interface KafkaModuleOptions {
  kafkaConfig: KafkaConnectionConfig;
  schemaRegistryConfig: SchemaRegistryConfig;
  // Legacy single producer/consumer (backward compatibility)
  producerConfig?: KafkaProducerConfig;
  consumerConfig?: KafkaConsumerConfig;
  // New multi-producer/consumer support
  producers?: NamedProducerConfig[];
  consumers?: NamedConsumerConfig[];
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
   * Soporta múltiples productores y consumidores nombrados
   */
  static registerAsync(options: AsyncKafkaModuleOptions): DynamicModule {
    const kafkaOptionsProvider: Provider = {
      provide: 'KAFKA_OPTIONS',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const schemaRegistryProvider: Provider = {
      provide: SchemaRegistryService,
      useFactory: async (kafkaOptions: KafkaModuleOptions) => {
        const schemaRegistryService = new SchemaRegistryService();
        await schemaRegistryService.initialize(
          kafkaOptions.schemaRegistryConfig,
        );
        return schemaRegistryService;
      },
      inject: ['KAFKA_OPTIONS'],
    };

    // Factory para crear token de productor
    const getProducerToken = (name: string): string => `KafkaProducer_${name}`;
    const getConsumerToken = (name: string): string => `KafkaConsumer_${name}`;

    // Este provider centraliza la creación dinámica de productores/consumidores
    const kafkaRegistryProvider: Provider = {
      provide: KafkaServiceRegistry,
      useFactory: (
        kafkaOptions: KafkaModuleOptions,
        schemaRegistryService: SchemaRegistryService,
      ): KafkaServiceRegistry => {
        const registry = new KafkaServiceRegistry();

        // Crear productores nombrados
        if (kafkaOptions.producers && kafkaOptions.producers.length > 0) {
          kafkaOptions.producers.forEach((namedProducer) => {
            const producer = new KafkaProducerService(
              schemaRegistryService,
              kafkaOptions.kafkaConfig,
              namedProducer.config,
            );
            registry.registerProducer(namedProducer.name, producer);
          });
        }

        // Crear consumidores nombrados
        if (kafkaOptions.consumers && kafkaOptions.consumers.length > 0) {
          kafkaOptions.consumers.forEach((namedConsumer) => {
            const consumer = new KafkaConsumerService(
              schemaRegistryService,
              kafkaOptions.kafkaConfig,
              namedConsumer.config,
            );
            registry.registerConsumer(namedConsumer.name, consumer);
          });
        }

        return registry;
      },
      inject: ['KAFKA_OPTIONS', SchemaRegistryService],
    };

    // Provider para inyección de productores por nombre para compatibilidad
    const multiProducerProvider: Provider = {
      provide: KafkaProducerService,
      useFactory: (
        kafkaOptions: KafkaModuleOptions,
        schemaRegistryService: SchemaRegistryService,
      ) => {
        // Si hay producerConfig único, retornar ese
        if (kafkaOptions.producerConfig) {
          return new KafkaProducerService(
            schemaRegistryService,
            kafkaOptions.kafkaConfig,
            kafkaOptions.producerConfig,
          );
        }
        // Si hay múltiples productores, retornar el primero (fallback)
        if (kafkaOptions.producers && kafkaOptions.producers.length > 0) {
          return new KafkaProducerService(
            schemaRegistryService,
            kafkaOptions.kafkaConfig,
            kafkaOptions.producers[0]!.config,
          );
        }
        return null;
      },
      inject: ['KAFKA_OPTIONS', SchemaRegistryService],
    };

    const multiConsumerProvider: Provider = {
      provide: KafkaConsumerService,
      useFactory: (
        kafkaOptions: KafkaModuleOptions,
        schemaRegistryService: SchemaRegistryService,
      ) => {
        // Si hay consumerConfig único, retornar ese
        if (kafkaOptions.consumerConfig) {
          return new KafkaConsumerService(
            schemaRegistryService,
            kafkaOptions.kafkaConfig,
            kafkaOptions.consumerConfig,
          );
        }
        // Si hay múltiples consumidores, retornar el primero (fallback)
        if (kafkaOptions.consumers && kafkaOptions.consumers.length > 0) {
          return new KafkaConsumerService(
            schemaRegistryService,
            kafkaOptions.kafkaConfig,
            kafkaOptions.consumers[0]!.config,
          );
        }
        return null;
      },
      inject: ['KAFKA_OPTIONS', SchemaRegistryService],
    };

    return {
      module: KafkaModule,
      imports: options.inject ? [] : [],
      providers: [
        kafkaOptionsProvider,
        schemaRegistryProvider,
        kafkaRegistryProvider,
        multiProducerProvider,
        multiConsumerProvider,
        {
          provide: 'KAFKA_PRODUCER_TOKEN',
          useValue: getProducerToken,
        },
        {
          provide: 'KAFKA_CONSUMER_TOKEN',
          useValue: getConsumerToken,
        },
      ],
      exports: [
        SchemaRegistryService,
        KafkaProducerService,
        KafkaConsumerService,
        KafkaServiceRegistry,
        'KAFKA_PRODUCER_TOKEN',
        'KAFKA_CONSUMER_TOKEN',
      ],
    };
  }

  /**
   * Obtén el token de inyección para un productor nombrado
   * @param name - Nombre del productor configurado
   * @example
   * constructor(
   *   @Inject(KafkaModule.getProducerToken('ValidationProducer'))
   *   @Optional()
   *   producer: KafkaProducerService
   * ) {}
   */
  static getProducerToken(name: string): string {
    return `KafkaProducer_${name}`;
  }

  /**
   * Obtén el token de inyección para un consumidor nombrado
   * @param name - Nombre del consumidor configurado
   * @example
   * constructor(
   *   @Inject(KafkaModule.getConsumerToken('ResponseConsumer'))
   *   @Optional()
   *   consumer: KafkaConsumerService
   * ) {}
   */
  static getConsumerToken(name: string): string {
    return `KafkaConsumer_${name}`;
  }
}
