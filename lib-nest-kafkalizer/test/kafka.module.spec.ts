import { KafkaConsumerService } from './../src/services/kafka-consumer.service.js';
import { KafkaProducerService } from './../src/services/kafka-producer.service.js';
import { KafkaServiceRegistry } from './../src/services/kafka-service-registry.service.js';
import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { KafkaModule } from '../src/config/kafka.module.js';
import { KafkaModuleOptions } from '../src/config/kafka.module.js';

describe('KafkaModule - Multi Producer/Consumer Support', () => {
  let module: TestingModule;
  let registry: KafkaServiceRegistry;
  let producerService: KafkaProducerService;
  let consumerService: KafkaConsumerService;

  const mockKafkaOptions: KafkaModuleOptions = {
    kafkaConfig: {
      brokers: ['localhost:9092'],
      clientId: 'test-client',
    },
    schemaRegistryConfig: {
      enabled: false,
    },
    producers: [
      {
        name: 'ValidationProducer',
        config: {
          topic: 'transaction-validation-request',
        },
      },
      {
        name: 'ResponseProducer',
        config: {
          topic: 'transaction-validation-response',
        },
      },
    ],
    consumers: [
      {
        name: 'ResponseConsumer',
        config: {
          topic: 'transaction-validation-response',
          groupId: 'payments-service-group',
        },
      },
      {
        name: 'NotificationConsumer',
        config: {
          topic: 'notifications',
          groupId: 'payments-service-group',
        },
      },
    ],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        KafkaModule.registerAsync({
          useFactory: () => mockKafkaOptions,
        }),
      ],
    }).compile();

    registry = module.get<KafkaServiceRegistry>(KafkaServiceRegistry);
    producerService =
      module.get<KafkaProducerService>(KafkaProducerService);
    consumerService =
      module.get<KafkaConsumerService>(KafkaConsumerService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('KafkaServiceRegistry', () => {
    it('should be defined', () => {
      expect(registry).toBeDefined();
    });

    it('should register multiple producers', () => {
      expect(registry.getProducerNames()).toHaveLength(2);
      expect(registry.getProducerNames()).toContain('ValidationProducer');
      expect(registry.getProducerNames()).toContain('ResponseProducer');
    });

    it('should register multiple consumers', () => {
      expect(registry.getConsumerNames()).toHaveLength(2);
      expect(registry.getConsumerNames()).toContain('ResponseConsumer');
      expect(registry.getConsumerNames()).toContain('NotificationConsumer');
    });

    it('should retrieve producer by name', () => {
      const producer = registry.getProducer('ValidationProducer');
      expect(producer).toBeInstanceOf(KafkaProducerService);
    });

    it('should retrieve consumer by name', () => {
      const consumer = registry.getConsumer('ResponseConsumer');
      expect(consumer).toBeInstanceOf(KafkaConsumerService);
    });

    it('should throw error for non-existent producer', () => {
      expect(() => {
        registry.getProducer('NonExistent');
      }).toThrow();
    });

    it('should throw error for non-existent consumer', () => {
      expect(() => {
        registry.getConsumer('NonExistent');
      }).toThrow();
    });

    it('should check producer existence', () => {
      expect(registry.hasProducer('ValidationProducer')).toBe(true);
      expect(registry.hasProducer('NonExistent')).toBe(false);
    });

    it('should check consumer existence', () => {
      expect(registry.hasConsumer('ResponseConsumer')).toBe(true);
      expect(registry.hasConsumer('NonExistent')).toBe(false);
    });
  });

  describe('Backward compatibility', () => {
    it('should provide default producer for legacy code', () => {
      expect(producerService).toBeDefined();
      expect(producerService).toBeInstanceOf(KafkaProducerService);
    });

    it('should provide default consumer for legacy code', () => {
      expect(consumerService).toBeDefined();
      expect(consumerService).toBeInstanceOf(KafkaConsumerService);
    });
  });

  describe('getProducerToken and getConsumerToken helpers', () => {
    it('should generate correct producer token', () => {
      const token = KafkaModule.getProducerToken('CustomProducer');
      expect(token).toBe('KafkaProducer_CustomProducer');
    });

    it('should generate correct consumer token', () => {
      const token = KafkaModule.getConsumerToken('CustomConsumer');
      expect(token).toBe('KafkaConsumer_CustomConsumer');
    });
  });
});

describe('KafkaModule - Legacy Single Producer/Consumer', () => {
  let module: TestingModule;
  let producerService: KafkaProducerService;
  let consumerService: KafkaConsumerService;

  const mockLegacyOptions: KafkaModuleOptions = {
    kafkaConfig: {
      brokers: ['localhost:9092'],
      clientId: 'legacy-client',
    },
    schemaRegistryConfig: {
      enabled: false,
    },
    producerConfig: {
      topic: 'legacy-topic',
    },
    consumerConfig: {
      topic: 'legacy-topic',
      groupId: 'legacy-group',
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        KafkaModule.registerAsync({
          useFactory: () => mockLegacyOptions,
        }),
      ],
    }).compile();

    producerService =
      module.get<KafkaProducerService>(KafkaProducerService);
    consumerService =
      module.get<KafkaConsumerService>(KafkaConsumerService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should support legacy single producer/consumer config', () => {
    expect(producerService).toBeDefined();
    expect(consumerService).toBeDefined();
    expect(producerService).toBeInstanceOf(KafkaProducerService);
    expect(consumerService).toBeInstanceOf(KafkaConsumerService);
  });

  it('should still provide registry even with legacy config', async () => {
    const registry = module.get<KafkaServiceRegistry>(KafkaServiceRegistry);
    expect(registry).toBeDefined();
  });
});
