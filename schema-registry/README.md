# Schema Registry Service

Confluent Schema Registry para validar y gestionar esquemas JSON de mensajes Kafka.

## Descripción

Este servicio proporciona:

- Almacenamiento centralizado de esquemas JSON
- Validación de mensajes contra esquemas
- Control de versiones de esquemas
- API REST para gestionar esquemas

## Configuración

- **Imagen**: `confluentinc/cp-schema-registry:7.4.0`
- **Puerto**: `8081`
- **Topics conectados**: Kafka en `kafka:29092`

## Variables de Entorno

```
SCHEMA_REGISTRY_HOST_NAME=schema-registry
SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS=kafka:29092
SCHEMA_REGISTRY_LISTENERS=http://0.0.0.0:8081
```

## API Endpoints

### Registrar un esquema

```bash
curl -X POST http://localhost:8081/subjects/transaction-validation-request-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schema": "{...}"
  }'
```

### Obtener esquema por ID

```bash
curl http://localhost:8081/schemas/ids/{id}
```

### Listar todos los esquemas

```bash
curl http://localhost:8081/subjects
```

### Obtener versión de esquema

```bash
curl http://localhost:8081/subjects/{subject}/versions/{version}
```

## Verificar Status

```bash
curl http://localhost:8081/subjects
```

## Referencias

- [Confluent Schema Registry Docs](https://docs.confluent.io/platform/current/schema-registry/index.html)
- [Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)
