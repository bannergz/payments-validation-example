import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service.js';
import { KafkaConsumerService } from './kafka-consumer.service.js';

/**
 * Servicio helper para acceder a múltiples productores y consumidores por nombre.
 * Útil cuando se usan setup con múltiples instancias nombradas.
 *
 * @example
 * constructor(private kafkaRegistry: KafkaServiceRegistry) {}
 *
 * async publishEvent() {
 *   const producer = this.kafkaRegistry.getProducer('ValidationProducer');
 *   await producer.publish(event);
 * }
 */
@Injectable()
export class KafkaServiceRegistry {
  private registry: Map<string, KafkaProducerService | KafkaConsumerService> =
    new Map();

  /**
   * Registrar un productor por nombre
   */
  registerProducer(name: string, producer: KafkaProducerService): void {
    this.registry.set(`producer:${name}`, producer);
  }

  /**
   * Registrar un consumidor por nombre
   */
  registerConsumer(name: string, consumer: KafkaConsumerService): void {
    this.registry.set(`consumer:${name}`, consumer);
  }

  /**
   * Obtener un productor por nombre
   * @throws Error si el productor no existe
   */
  getProducer(name: string): KafkaProducerService {
    const key = `producer:${name}`;
    const producer = this.registry.get(key);

    if (!producer) {
      throw new Error(
        `Producer "${name}" not found in registry. Available producers: ${Array.from(this.registry.keys())
          .filter((k) => k.startsWith('producer:'))
          .map((k) => k.replace('producer:', ''))
          .join(', ')}`,
      );
    }

    return producer as KafkaProducerService;
  }

  /**
   * Obtener un consumidor por nombre
   * @throws Error si el consumidor no existe
   */
  getConsumer(name: string): KafkaConsumerService {
    const key = `consumer:${name}`;
    const consumer = this.registry.get(key);

    if (!consumer) {
      throw new Error(
        `Consumer "${name}" not found in registry. Available consumers: ${Array.from(this.registry.keys())
          .filter((k) => k.startsWith('consumer:'))
          .map((k) => k.replace('consumer:', ''))
          .join(', ')}`,
      );
    }

    return consumer as KafkaConsumerService;
  }

  /**
   * Verificar si un productor existe
   */
  hasProducer(name: string): boolean {
    return this.registry.has(`producer:${name}`);
  }

  /**
   * Verificar si un consumidor existe
   */
  hasConsumer(name: string): boolean {
    return this.registry.has(`consumer:${name}`);
  }

  /**
   * Obtener lista de productores registrados
   */
  getProducerNames(): string[] {
    return Array.from(this.registry.keys())
      .filter((k) => k.startsWith('producer:'))
      .map((k) => k.replace('producer:', ''));
  }

  /**
   * Obtener lista de consumidores registrados
   */
  getConsumerNames(): string[] {
    return Array.from(this.registry.keys())
      .filter((k) => k.startsWith('consumer:'))
      .map((k) => k.replace('consumer:', ''));
  }

  /**
   * Limpiar la registry (útil para tests)
   */
  clear(): void {
    this.registry.clear();
  }
}
