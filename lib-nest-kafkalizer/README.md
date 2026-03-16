# lib-nest-kafkalizer

Librería NestJS compartida para abstraer la configuración y logística de KafkaJS con soporte parametrizable para Schema Registry.

## Características

✅ **Configuración centralizada** - Un único lugar para Kafka y Schema Registry
✅ **Parametrizable** - Configura tópicos, consumer groups, etc. por servicio
✅ **Schema Registry opcional** - Habilita/deshabilita con un flag
✅ **Genérico** - Producer y Consumer reutilizables
✅ **Type-safe** - Full TypeScript support
✅ **NestJS Integration** - Ciclo de vida automático (OnModuleInit/OnModuleDestroy)
✅ **Batch support** - Publica múltiples mensajes en lote
✅ **Manejo de errores** - Logging centralizado

## Instalación

```bash
cd lib-nest-kafkalizer
npm install
npm run build
```

Los servicios pueden referenciar esta librería en su `package.json`:

```json
{
  "dependencies": {
    "lib-nest-kafkalizer": "file:../lib-nest-kafkalizer"
  }
}
```

## Uso Básico

### 1. Importar el módulo en AppModule

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaModule, KafkaConfigBuilder } from 'lib-nest-kafkalizer';

@Module({
  imports: [
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          kafkaConfig: KafkaConfigBuilder.fromEnv({
            clientId: process.env.APP_NAME,
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          }),
          schemaRegistryConfig: KafkaConfigBuilder.schemaRegistry(
            process.env.ENABLE_SCHEMA_REGISTRY === 'true',
            process.env.SCHEMA_REGISTRY_URL,
          ),
          producerConfig: KafkaConfigBuilder.forProducer(
            'transaction-validation-request',
          ),
          consumerConfig: KafkaConfigBuilder.forConsumer(
            'transaction-validation-response',
            'payments-service-group',
          ),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 2. Usar en un servicio (Producer)

```typescript
import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from 'lib-nest-kafkalizer';

@Injectable()
export class TransactionEventProducer {
  constructor(private kafkaProducer: KafkaProducerService) {}

  async publishValidationRequest(data: any) {
    return this.kafkaProducer.publish(data, {
      key: data.transactionExternalId,
      headers: {
        'correlation-id': data.eventId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async publishBatch(items: any[]) {
    return this.kafkaProducer.publishBatch(items);
  }
}
```

### 3. Usar en un servicio (Consumer)

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService, MessageHandler } from 'lib-nest-kafkalizer';

@Injectable()
export class TransactionResponseConsumer implements OnModuleInit {
  constructor(private kafkaConsumer: KafkaConsumerService) {}

  async onModuleInit() {
    this.kafkaConsumer.setMessageHandler(this.handleMessage.bind(this));
  }

  private async handleMessage: MessageHandler = async (message) => {
    console.log(`Received message from partition ${message.partition}:`, message.value);
    // Procesar el mensaje
  };
}
```

## Configuración Avanzada

### Usar decoradores

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaConsumer, KafkaConsumerService, MessageHandler } from 'lib-nest-kafkalizer';

@KafkaConsumer({
  topic: 'transaction-validation-response',
  groupId: 'payments-service-group',
  fromBeginning: false,
})
@Injectable()
export class TransactionResponseConsumer implements OnModuleInit {
  constructor(private kafkaConsumer: KafkaConsumerService) {}

  async onModuleInit() {
    this.kafkaConsumer.setMessageHandler(this.handleMessage.bind(this));
  }

  private async handleMessage: MessageHandler = async (message) => {
    // Procesar
  };
}
```

### Configuración con Schema Registry

```typescript
const kafkaOptions = {
  kafkaConfig: {
    /* ... */
  },
  schemaRegistryConfig: {
    enabled: true,
    url: 'http://schema-registry:8081',
    subject: 'transaction-validation-request-schema', // Nombre del esquema en registry
  },
  producerConfig: KafkaConfigBuilder.forProducer('my-topic'),
  consumerConfig: KafkaConfigBuilder.forConsumer('my-topic', 'my-group'),
};
```

Si `enabled` es `false`, los mensajes se serializar como JSON plano.

### Configuración sin Schema Registry

```typescript
const kafkaOptions = {
  // ...
  schemaRegistryConfig: {
    enabled: false,
  },
  // Los mensajes se envían como JSON sin codificación
};
```

## Variables de Entorno

```env
# Kafka
KAFKA_BROKERS=kafka:29092
APP_NAME=my-service

# Schema Registry (opcional)
ENABLE_SCHEMA_REGISTRY=true
SCHEMA_REGISTRY_URL=http://schema-registry:8081
SCHEMA_REGISTRY_SUBJECT=my-schema-name
```

## Migration Guide

### Antes (en ms-frauds-bs)

```typescript
// src/frauds/config/kafka.config.ts
export const kafkaConfig = {
  /* hardcoded */
};

// src/frauds/event/transaction.request.consumer.ts
export class TransactionRequestConsumer implements OnModuleInit {
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      /* config */
    });
    this.consumer = this.kafka.consumer({
      /* config */
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    // Manual subscribe
  }
}
```

### Después (con lib-nest-kafkalizer)

```typescript
// app.module.ts
@Module({
  imports: [
    KafkaModule.registerAsync({
      useFactory: () => ({
        kafkaConfig: KafkaConfigBuilder.fromEnv(),
        schemaRegistryConfig: KafkaConfigBuilder.schemaRegistry(true),
        consumerConfig: KafkaConfigBuilder.forConsumer(
          'transaction-validation-request',
          'frauds-service-group',
        ),
      }),
    }),
  ],
})
export class AppModule {}

// src/frauds/event/transaction.request.consumer.ts
@Injectable()
export class TransactionRequestConsumer implements OnModuleInit {
  constructor(private kafkaConsumer: KafkaConsumerService) {}

  async onModuleInit() {
    this.kafkaConsumer.setMessageHandler(this.handleMessage.bind(this));
  }

  private async handleMessage: MessageHandler = async (message) => {
    // Procesamiento
  };
}
```

## API Reference

### KafkaProducerService

```typescript
// Publicar un mensaje
publish<T>(value: T, options?: PublishOptions): Promise<PublishResult[]>

// Publicar múltiples en batch
publishBatch<T>(values: T[], baseOptions?: PublishOptions): Promise<PublishResult[][]>

// Obtener el producer (casos avanzados)
getProducer(): Producer | null

// Verificar conexión
isConnected(): boolean
```

### KafkaConsumerService

```typescript
// Registrar handler para procesar mensajes
setMessageHandler(handler: MessageHandler): void

// Obtener el consumer (casos avanzados)
getConsumer(): Consumer | null

// Verificar conexión
isConnected(): boolean
```

### SchemaRegistryService

```typescript
// Inicializar
initialize(config: SchemaRegistryConfig): Promise<void>

// Obtener ID del esquema más reciente
getLatestSchemaId(subject: string): Promise<number>

// Codificar
encode(id: number, value: unknown): Promise<Buffer>

// Decodificar
decode(buffer: Buffer): Promise<unknown>

// Verificar si está habilitado
isEnabled(): boolean
```

## Ciclo de Vida

El módulo gestiona automáticamente:

- ✅ **OnModuleInit** - Conecta Producer/Consumer
- ✅ **OnModuleDestroy** - Desconecta y limpia recursos
- ✅ **Error Handling** - Logging centralizado
- ✅ **Schema Registry** - Inicialización automática

## Ejemplos Completos

Ver carpeta `examples/` para implementaciones completas en ms-payments-bs y ms-frauds-bs.

## Troubleshooting

### Producer no conecta

```
Error: Producer is not connected
```

AsSegúrate que el módulo está correctamente importado en AppModule y que las variables de entorno están configuradas.

### Schema Registry timeout

```
Error: Failed to connect to Schema Registry
```

Verifica:

1. La URL de Schema Registry es correcta
2. El servidor de Schema Registry está corriendo
3. El flag `ENABLE_SCHEMA_REGISTRY=true` está establecido

### Mensajes perdidos

Asegúrate que:

1. Consumer tiene `fromBeginning: false` si quieres solo nuevos mensajes
2. Consumer group ID es único por servicio
3. Error handling está implementado correctamente

## Licencia

MIT
