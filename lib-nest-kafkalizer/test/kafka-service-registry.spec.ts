import { KafkaConsumerService } from '../src/services/kafka-consumer.service.js';
import { SchemaRegistryService } from '../src/services/schema-registry.service.js';
import { KafkaProducerService } from '../src/services/kafka-producer.service.js';
import { KafkaServiceRegistry } from '../src/services/kafka-service-registry.service.js';

describe('KafkaServiceRegistry', () => {
  let registry: KafkaServiceRegistry;
  let mockProducer1: KafkaProducerService;
  let mockProducer2: KafkaProducerService;
  let mockConsumer1: KafkaConsumerService;
  let mockConsumer2: KafkaConsumerService;
  let mockSchemaRegistry: SchemaRegistryService;

  beforeEach(() => {
    registry = new KafkaServiceRegistry();

    // Create mock services
    mockSchemaRegistry = {
      initialize: jest.fn(),
      encode: jest.fn(),
      decode: jest.fn(),
      isEnabled: jest.fn().mockReturnValue(false),
      getLatestSchemaId: jest.fn(),
    } as unknown as SchemaRegistryService;

    mockProducer1 = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      publish: jest.fn(),
    } as unknown as KafkaProducerService;

    mockProducer2 = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      publish: jest.fn(),
    } as unknown as KafkaProducerService;

    mockConsumer1 = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      setMessageHandler: jest.fn(),
    } as unknown as KafkaConsumerService;

    mockConsumer2 = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      setMessageHandler: jest.fn(),
    } as unknown as KafkaConsumerService;
  });

  describe('registerProducer', () => {
    it('should register a producer', () => {
      registry.registerProducer('Producer1', mockProducer1);

      expect(registry.hasProducer('Producer1')).toBe(true);
    });

    it('should register multiple producers', () => {
      registry.registerProducer('Producer1', mockProducer1);
      registry.registerProducer('Producer2', mockProducer2);

      expect(registry.hasProducer('Producer1')).toBe(true);
      expect(registry.hasProducer('Producer2')).toBe(true);
    });

    it('should overwrite existing producer with same name', () => {
      registry.registerProducer('Producer1', mockProducer1);
      registry.registerProducer('Producer1', mockProducer2);

      const producer = registry.getProducer('Producer1');
      expect(producer).toBe(mockProducer2);
    });
  });

  describe('registerConsumer', () => {
    it('should register a consumer', () => {
      registry.registerConsumer('Consumer1', mockConsumer1);

      expect(registry.hasConsumer('Consumer1')).toBe(true);
    });

    it('should register multiple consumers', () => {
      registry.registerConsumer('Consumer1', mockConsumer1);
      registry.registerConsumer('Consumer2', mockConsumer2);

      expect(registry.hasConsumer('Consumer1')).toBe(true);
      expect(registry.hasConsumer('Consumer2')).toBe(true);
    });
  });

  describe('getProducer', () => {
    it('should retrieve registered producer', () => {
      registry.registerProducer('Producer1', mockProducer1);

      const producer = registry.getProducer('Producer1');
      expect(producer).toBe(mockProducer1);
    });

    it('should throw error for unregistered producer', () => {
      expect(() => {
        registry.getProducer('NonExistent');
      }).toThrow(/Producer "NonExistent" not found/);
    });

    it('should include available producers in error message', () => {
      registry.registerProducer('Producer1', mockProducer1);
      registry.registerProducer('Producer2', mockProducer2);

      expect(() => {
        registry.getProducer('NonExistent');
      }).toThrow(/Producer1|Producer2/);
    });
  });

  describe('getConsumer', () => {
    it('should retrieve registered consumer', () => {
      registry.registerConsumer('Consumer1', mockConsumer1);

      const consumer = registry.getConsumer('Consumer1');
      expect(consumer).toBe(mockConsumer1);
    });

    it('should throw error for unregistered consumer', () => {
      expect(() => {
        registry.getConsumer('NonExistent');
      }).toThrow(/Consumer "NonExistent" not found/);
    });

    it('should include available consumers in error message', () => {
      registry.registerConsumer('Consumer1', mockConsumer1);
      registry.registerConsumer('Consumer2', mockConsumer2);

      expect(() => {
        registry.getConsumer('NonExistent');
      }).toThrow(/Consumer1|Consumer2/);
    });
  });

  describe('hasProducer', () => {
    it('should return true for registered producer', () => {
      registry.registerProducer('Producer1', mockProducer1);

      expect(registry.hasProducer('Producer1')).toBe(true);
    });

    it('should return false for unregistered producer', () => {
      expect(registry.hasProducer('NonExistent')).toBe(false);
    });
  });

  describe('hasConsumer', () => {
    it('should return true for registered consumer', () => {
      registry.registerConsumer('Consumer1', mockConsumer1);

      expect(registry.hasConsumer('Consumer1')).toBe(true);
    });

    it('should return false for unregistered consumer', () => {
      expect(registry.hasConsumer('NonExistent')).toBe(false);
    });
  });

  describe('getProducerNames', () => {
    it('should return empty array initially', () => {
      expect(registry.getProducerNames()).toEqual([]);
    });

    it('should return names of registered producers', () => {
      registry.registerProducer('Producer1', mockProducer1);
      registry.registerProducer('Producer2', mockProducer2);

      const names = registry.getProducerNames();
      expect(names).toHaveLength(2);
      expect(names).toContain('Producer1');
      expect(names).toContain('Producer2');
    });
  });

  describe('getConsumerNames', () => {
    it('should return empty array initially', () => {
      expect(registry.getConsumerNames()).toEqual([]);
    });

    it('should return names of registered consumers', () => {
      registry.registerConsumer('Consumer1', mockConsumer1);
      registry.registerConsumer('Consumer2', mockConsumer2);

      const names = registry.getConsumerNames();
      expect(names).toHaveLength(2);
      expect(names).toContain('Consumer1');
      expect(names).toContain('Consumer2');
    });
  });

  describe('clear', () => {
    it('should remove all registered services', () => {
      registry.registerProducer('Producer1', mockProducer1);
      registry.registerConsumer('Consumer1', mockConsumer1);

      registry.clear();

      expect(registry.hasProducer('Producer1')).toBe(false);
      expect(registry.hasConsumer('Consumer1')).toBe(false);
    });

    it('should allow re-registration after clear', () => {
      registry.registerProducer('Producer1', mockProducer1);
      registry.clear();
      registry.registerProducer('Producer1', mockProducer2);

      expect(registry.getProducer('Producer1')).toBe(mockProducer2);
    });
  });

  describe('mixed operations', () => {
    it('should support registering and retrieving both producers and consumers', () => {
      registry.registerProducer('Producer1', mockProducer1);
      registry.registerProducer('Producer2', mockProducer2);
      registry.registerConsumer('Consumer1', mockConsumer1);
      registry.registerConsumer('Consumer2', mockConsumer2);

      expect(registry.getProducerNames()).toHaveLength(2);
      expect(registry.getConsumerNames()).toHaveLength(2);

      expect(registry.getProducer('Producer1')).toBe(mockProducer1);
      expect(registry.getConsumer('Consumer1')).toBe(mockConsumer1);
    });

    it('should keep producers and consumers separate', () => {
      registry.registerProducer('Service', mockProducer1);
      registry.registerConsumer('Service', mockConsumer1);

      expect(registry.getProducer('Service')).toBe(mockProducer1);
      expect(registry.getConsumer('Service')).toBe(mockConsumer1);
    });
  });
});
