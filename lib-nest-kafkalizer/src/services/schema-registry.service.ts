import { Injectable } from '@nestjs/common';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { SchemaRegistryConfig } from 'src/types/kafka.types.js';

/**
 * Servicio de Schema Registry - maneja la codificación/decodificación de mensajes
 */
@Injectable()
export class SchemaRegistryService {
  private registry: SchemaRegistry | null = null;
  private enabled: boolean = false;
  private config: SchemaRegistryConfig | null = null;

  async initialize(config: SchemaRegistryConfig): Promise<void> {
    this.config = config;
    if (config.enabled && config.url) {
      this.enabled = true;
      this.registry = new SchemaRegistry({
        host: config.url,
      });
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getConfig(): SchemaRegistryConfig | null {
    return this.config;
  }

  /**
   * Obtiene el ID del esquema más reciente
   */
  async getLatestSchemaId(subject: string): Promise<number> {
    if (!this.registry) {
      throw new Error('Schema Registry is not enabled or initialized');
    }
    return this.registry.getLatestSchemaId(subject);
  }

  /**
   * Codifica un valor usando el esquema
   */
  async encode(id: number, value: unknown): Promise<Buffer> {
    if (!this.registry) {
      throw new Error('Schema Registry is not enabled or initialized');
    }
    return this.registry.encode(id, value);
  }

  /**
   * Decodifica un buffer usando el esquema
   */
  async decode(buffer: Buffer): Promise<unknown> {
    if (!this.registry) {
      throw new Error('Schema Registry is not enabled or initialized');
    }
    return this.registry.decode(buffer);
  }

  /**
   * Obtiene el esquema por su ID
   */
  async getSchemaById(id: number): Promise<any> {
    if (!this.registry) {
      throw new Error('Schema Registry is not enabled or initialized');
    }
    return this.registry.getSchema(id);
  }
}
