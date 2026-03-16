import { KafkaConsumerConfig } from '../types';

/**
 * Decorador para marcar una clase como un Kafka Consumer
 *
 * @example
 * @KafkaConsumer({
 *   topic: 'my-topic',
 *   groupId: 'my-consumer-group',
 *   fromBeginning: false
 * })
 * export class MyConsumer implements OnModuleInit {
 *   constructor(private consumerService: KafkaConsumerService) {}
 *
 *   async onModuleInit() {
 *     this.consumerService.setMessageHandler(async (message) => {
 *       console.log('Message received:', message);
 *     });
 *   }
 * }
 */
export function KafkaConsumer(config: Omit<KafkaConsumerConfig, 'eachMessage'>) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata('kafka:consumer:config', config, constructor);
    return constructor;
  };
}

/**
 * Decorador para marcar una clase como un Kafka Producer
 *
 * @example
 * @KafkaProducer({
 *   topic: 'my-topic',
 *   compression: 2 // Snappy
 * })
 * export class MyProducer implements OnModuleInit {
 *   constructor(private producerService: KafkaProducerService) {}
 *
 *   async publishEvent(data: any) {
 *     await this.producerService.publish(data, {
 *       key: 'my-key',
 *       headers: { 'correlation-id': 'xxx' }
 *     });
 *   }
 * }
 */
export function KafkaProducer(config: any) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata('kafka:producer:config', config, constructor);
    return constructor;
  };
}
