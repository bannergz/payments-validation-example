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

### 1. Importar el módulo en AppModule (Opción 1: Modo Simple)

Para servicios con un único productor o consumidor:

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

### 1B. Importar el módulo en AppModule (Opción 2: Modo Multi-Productor/Consumidor)

Para servicios que necesitan múltiples productores o consumidores con diferentes tópicos/grupos:

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaModule } from 'lib-nest-kafkalizer';

@Module({
  imports: [
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          kafkaConfig: {
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
            clientId: process.env.APP_NAME || 'my-service',
          },
          schemaRegistryConfig: {
            enabled: process.env.ENABLE_SCHEMA_REGISTRY === 'true',
            url: process.env.SCHEMA_REGISTRY_URL,
          },
          // Múltiples productores
          producers: [
            {
              name: 'ValidationRequestProducer',
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
            {
              name: 'NotificationProducer',
              config: {
                topic: 'notifications',
              },
            },
          ],
          // Múltiples consumidores
          consumers: [
            {
              name: 'ValidationResponseConsumer',
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

### 2B. Usar en un servicio (Multi-Producer - Opción 2)

```typescript
import { Injectable } from '@nestjs/common';
import { KafkaServiceRegistry } from 'lib-nest-kafkalizer';

@Injectable()
export class TransactionEventProducer {
  constructor(private kafkaRegistry: KafkaServiceRegistry) {}

  async publishValidationRequest(data: any) {
    const producer = this.kafkaRegistry.getProducer(
      'ValidationRequestProducer',
    );
    return producer.publish(data, {
      key: data.transactionExternalId,
      headers: {
        'correlation-id': data.eventId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async publishResponse(data: any) {
    const producer = this.kafkaRegistry.getProducer('ResponseProducer');
    return producer.publish(data, {
      key: data.transactionExternalId,
    });
  }

  async publishNotification(data: any) {
    const producer = this.kafkaRegistry.getProducer('NotificationProducer');
    return producer.publish(data, {
      key: data.userId,
    });
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

### 3B. Usar en un servicio (Multi-Consumer - Opción 2)

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaServiceRegistry, MessageHandler } from 'lib-nest-kafkalizer';

@Injectable()
export class TransactionResponseConsumer implements OnModuleInit {
  constructor(private kafkaRegistry: KafkaServiceRegistry) {}

  async onModuleInit() {
    // Configurar handler para ValidationResponseConsumer
    const validationConsumer = this.kafkaRegistry.getConsumer(
      'ValidationResponseConsumer',
    );
    validationConsumer.setMessageHandler(this.handleValidationResponse.bind(this));

    // Configurar handler para NotificationConsumer
    const notificationConsumer = this.kafkaRegistry.getConsumer(
      'NotificationConsumer',
    );
    notificationConsumer.setMessageHandler(this.handleNotification.bind(this));
  }

  private async handleValidationResponse: MessageHandler = async (message) => {
    console.log('Validation response received:', message.value);
    // Procesar respuesta de validación
  };

  private async handleNotification: MessageHandler = async (message) => {
    console.log('Notification received:', message.value);
    // Procesar notificación
  };
}
```

## Configuración Avanzada

### Multi-Producer y Multi-Consumer (Recomendado para servicios complejos)

Si tu servicio necesita consumir de múltiples tópicos o producir en múltiples tópicos, usa los arrays `producers` y `consumers`:

```typescript
const kafkaOptions = {
  kafkaConfig: {
    /* ... */
  },
  schemaRegistryConfig: {
    /* ... */
  },

  // Múltiples productores - cada uno con su propio tópico
  producers: [
    { name: 'ValidationProducer', config: { topic: 'validation-topic' } },
    { name: 'NotificationProducer', config: { topic: 'notifications' } },
    { name: 'AuditProducer', config: { topic: 'audit-log' } },
  ],

  // Múltiples consumidores - cada uno con su propio tópico y grupo
  consumers: [
    {
      name: 'ValidationResponseConsumer',
      config: { topic: 'validation-response', groupId: 'my-service-group' },
    },
    {
      name: 'EventNotificationConsumer',
      config: { topic: 'events', groupId: 'my-service-group' },
    },
  ],
};
```

**Inyección en servicios:**

```typescript
import { Injectable } from '@nestjs/common';
import { KafkaServiceRegistry } from 'lib-nest-kafkalizer';

@Injectable()
export class MyService {
  constructor(private kafkaRegistry: KafkaServiceRegistry) {}

  async processValidation(data: any) {
    // Obtener un productor específico
    const producer = this.kafkaRegistry.getProducer('ValidationProducer');
    await producer.publish(data);
  }

  async sendNotification(data: any) {
    const notificationProducer = this.kafkaRegistry.getProducer(
      'NotificationProducer',
    );
    await notificationProducer.publish(data);
  }

  // Verificar que un productor/consumidor existe antes de usarlo
  hasNotificationProducer() {
    return this.kafkaRegistry.hasProducer('NotificationProducer');
  }

  // Listar todos los productores/consumidores disponibles
  getAvailableProducers() {
    return this.kafkaRegistry.getProducerNames();
  }

  getAvailableConsumers() {
    return this.kafkaRegistry.getConsumerNames();
  }
}
```

**Ventajas de la Opción 2 (Multi):**

- ✅ Flexibilidad: Cada productor/consumidor puede tener diferentes configuraciones
- ✅ Escalabilidad: Fácil agregar nuevos tópicos sin modificar el código existente
- ✅ Separation of Concerns: Cada tópico con su lógica independiente
- ✅ Testing: Más fácil mockear servicios específicos
- ✅ Backward compatible: La Opción 1 (modo simple) aún funciona

### Usar decoradores (Opcional)

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

### De implementación manual a lib-nest-kafkalizer (Opción 2: Multi)

**Antes** (ms-frauds-bs original - con hardcoding):

```typescript
// src/frauds/config/kafka.config.ts
export const kafkaConfig = {
  clientId: 'ms-frauds-bs',
  brokers: ['kafka:29092'],
  // ...
};

// src/frauds/event/transaction.request.consumer.ts
export class TransactionRequestConsumer implements OnModuleInit {
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka(kafkaConfig);
    this.consumer = this.kafka.consumer({
      groupId: 'frauds-service-group',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['transaction-validation-request'],
      fromBeginning: false,
    });
    // Manual message handling
  }
}
```

**Después** (con lib-nest-kafkalizer - Opción 2):

```typescript
// app.module.ts
@Module({
  imports: [
    KafkaModule.registerAsync({
      useFactory: () => ({
        kafkaConfig: {
          brokers: ['kafka:29092'],
          clientId: 'ms-frauds-bs',
        },
        schemaRegistryConfig: { enabled: true },
        consumers: [
          {
            name: 'TransactionRequestConsumer',
            config: {
              topic: 'transaction-validation-request',
              groupId: 'frauds-service-group',
            },
          },
        ],
      }),
    }),
  ],
})
export class AppModule {}

// src/frauds/event/transaction.request.consumer.ts
@Injectable()
export class TransactionRequestConsumer implements OnModuleInit {
  constructor(private kafkaRegistry: KafkaServiceRegistry) {}

  async onModuleInit() {
    const consumer = this.kafkaRegistry.getConsumer(
      'TransactionRequestConsumer',
    );
    consumer.setMessageHandler(this.handleMessage.bind(this));
  }

  private async handleMessage: MessageHandler = async (message) => {
    // Procesamiento automático
  };
}
```

**Beneficios de la migración:**

- 🎯 Configuración centralizada
- 🔄 Auto-conexión/desconexión
- 📊 Mejor error handling
- 🧪 Más fácil de testear
- 🚀 Schema Registry integrado

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
