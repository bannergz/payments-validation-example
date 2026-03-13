# lib-nest-kafkalizer

Librería para facilitar el uso de kafkajs en proyectos Node.js/NestJS, con abstracción de configuración, DLQ, reintentos y validación con schema registry.

## Características

- Abstracción de configuración vía `.env` o parámetros.
- Consumo y producción de mensajes Kafka.
- Validación y serialización con Schema Registry.
- Gestión automática de DLQ (Dead Letter Queue) para mensajes fallidos.
- Reintentos configurables para handlers.

## Instalación

```
npm install ../lib-nest-kafkalizer
```

## Uso básico

```typescript
import { Kafkalizer } from 'lib-nest-kafkalizer';

const kafkalizer = new Kafkalizer();
await kafkalizer.connect();

await kafkalizer.subscribe('mi-topico', async (data) => {
  // Procesa el mensaje
});

await kafkalizer.produce('otro-topico', { foo: 'bar' });
```

## Configuración

Puedes usar variables de entorno o pasar opciones al constructor:

- KAFKA_BROKERS
- KAFKA_CLIENT_ID
- KAFKA_GROUP_ID
- SCHEMA_REGISTRY_URL
- DLQ_TOPIC
- RETRY_ATTEMPTS

Ver `.env.example` para referencia.

## DLQ y Reintentos

- Los mensajes que fallen tras los reintentos serán enviados automáticamente al tópico DLQ.

## License

MIT
