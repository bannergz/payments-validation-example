# Ejemplos de Uso - MS-Payments + Schema Registry

Ejemplos prácticos de cómo usar el sistema completo.

## 1. Crear una Transacción via GraphQL

### Abrir GraphQL Playground

```
http://localhost:3000/graphql
```

### Mutation: Crear transacción

```graphql
mutation CreateTransaction {
  createTransaction(
    input: {
      accountExternalIdDebit: "550e8400-e29b-41d4-a716-446655440000"
      accountExternalIdCredit: "550e8400-e29b-41d4-a716-446655440001"
      transferTypeId: 1
      value: 500
    }
  ) {
    transactionExternalId
    accountExternalIdDebit
    accountExternalIdCredit
    transactionType {
      id
      name
    }
    transactionStatus {
      id
      name
    }
    value
    createdAt
  }
}
```

### Respuesta esperada:

```json
{
  "data": {
    "createTransaction": {
      "transactionExternalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "accountExternalIdDebit": "550e8400-e29b-41d4-a716-446655440000",
      "accountExternalIdCredit": "550e8400-e29b-41d4-a716-446655440001",
      "transactionType": {
        "id": 1,
        "name": "transfer"
      },
      "transactionStatus": {
        "id": 1,
        "name": "pending"
      },
      "value": 500,
      "createdAt": "2026-03-11T10:30:00Z"
    }
  }
}
```

---

## 2. Consultar una Transacción

### Query

```graphql
query GetTransaction {
  getTransaction(
    transactionExternalId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  ) {
    transactionExternalId
    accountExternalIdDebit
    accountExternalIdCredit
    transactionType {
      id
      name
    }
    transactionStatus {
      id
      name
    }
    value
    createdAt
  }
}
```

---

## 3. Ver Mensaje en Kafka UI

1. Accede a **http://localhost:8080**
2. En el menú lateral, selecciona **Kafka Cluster** → **Topics**
3. Busca el topic `transaction-validation-request`
4. Ve la tab **Messages**
5. Verás los eventos de transacciones

### Estructura del mensaje en Kafka:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventTimestamp": "2026-03-11T10:30:00Z",
  "eventType": "TRANSACTION_CREATED",
  "transaction": {
    "transactionExternalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "accountExternalIdDebit": "550e8400-e29b-41d4-a716-446655440000",
    "accountExternalIdCredit": "550e8400-e29b-41d4-a716-446655440001",
    "transactionType": {
      "id": 1,
      "name": "transfer"
    },
    "transactionStatus": {
      "id": 1,
      "name": "pending"
    },
    "value": 500,
    "createdAt": "2026-03-11T10:30:00Z"
  }
}
```

---

## 4. Verificar Esquemas en Schema Registry

### Via cURL: Listar todos los esquemas

```bash
curl http://localhost:8081/subjects
```

Respuesta esperada:

```json
["transaction-validation-request-value"]
```

### Via cURL: Obtener esquema completo

```bash
curl http://localhost:8081/subjects/transaction-validation-request-value/versions/latest
```

Respuesta:

```json
{
  "subject": "transaction-validation-request-value",
  "version": 1,
  "id": 1,
  "schema": "{\"$schema\":\"http://json-schema.org/draft-07/schema#\", ...}"
}
```

### Via cURL: Validar un mensaje contra el esquema

```bash
curl -X POST http://localhost:8081/compatibility/subjects/transaction-validation-request-value/versions/latest \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schema": "{...schema json...}"
  }'
```

---

## 5. Ver Logs de Kafka

```bash
# Ver últimas 50 líneas de Kafka
docker-compose logs -n 50 kafka

# Ver logs en tiempo real
docker-compose logs -f kafka

# O con script helper (Linux/Mac)
./docker-helper.sh logs-kafka
```

---

## 6. Monitorear Health Check

```bash
# Ver estado de todos los servicios
docker-compose ps

# O con script helper
./docker-helper.sh health
```

Salida esperada:

```
NAME                    STATUS
postgres                Up 2 minutes (healthy)
kafka                   Up 2 minutes (healthy)
schema-registry         Up 2 minutes (healthy)
ms-payments-bs          Up 2 minutes (healthy)
```

---

## 7. Transacción Rechazada (Valor > 1000)

### Crear transacción con valor > 1000

```graphql
mutation {
  createTransaction(
    input: {
      accountExternalIdDebit: "550e8400-e29b-41d4-a716-446655440000"
      accountExternalIdCredit: "550e8400-e29b-41d4-a716-446655440001"
      transferTypeId: 1
      value: 1500
    }
  ) {
    transactionExternalId
    transactionStatus {
      id
      name
    }
    value
    createdAt
  }
}
```

### Respuesta: Es rechazada automáticamente

```json
{
  "transactionExternalId": "xyz...",
  "transactionStatus": {
    "id": 3,
    "name": "rejected"
  },
  "value": 1500,
  "createdAt": "2026-03-11T10:35:00Z"
}
```

---

## 8. Verificar Base de Datos Directamente

### Conectar a PostgreSQL

```bash
# Desde la terminal
psql -h localhost -U postgres -d payments_db

# Luego en psql:
SELECT * FROM "Transaction";
```

O usar un cliente GUI como **pgAdmin**, **DBeaver**, etc.

---

## 9. Reiniciar Servicios Específicos

```bash
# Reiniciar solo Kafka
docker-compose restart kafka

# Reiniciar solo Schema Registry
docker-compose restart schema-registry

# Reiniciar solo la app
docker-compose restart ms-payments-bs

# O con script
./docker-helper.sh restart-app
```

---

## 10. Limpiar y Empezar de Cero

```bash
# Detener y eliminar TODO (incluyendo datos)
docker-compose down -v

# Luego levantar de nuevo
docker-compose up -d
```

---

## Casos de Uso Comunes

### Desarrollo Local con Hot-Reload

```bash
# Terminal 1: Levanta infraestructura
docker-compose up -d postgres mongo zookeeper kafka schema-registry

# Terminal 2: Levanta app con watch
cd ms-payments-bs
npm run start:dev
```

### Testing E2E

```bash
# Asegurate que todo está levantado
docker-compose up -d

# Luego ejecuta tests
cd ms-payments-bs
npm run test:e2e
```

### Verificar que Schema Registry funciona

```bash
#1. Crear transacción
# (desde GraphQL playground)

#2. Ver que llegó a Kafka
# http://localhost:8080
# Topics → transaction-validation-request → Messages

#3. Verificar esquema está registrado
curl http://localhost:8081/subjects

#4. Ver detalles del esquema
curl http://localhost:8081/subjects/transaction-validation-request-value/versions/latest
```

---

## Troubleshooting

### GraphQL Playground no abre

```bash
# Verificar que la app está corriendo
docker-compose ps ms-payments-bs

# Ver logs
docker-compose logs ms-payments-bs

# Reiniciar
docker-compose restart ms-payments-bs
```

### Kafka muestra "connection refused"

```bash
# Verificar que Kafka + Zookeeper están levantados
docker-compose ps kafka zookeeper

# Reiniciar
docker-compose restart zookeeper kafka
```

### Schema Registry retorna errores 404

```bash
# El topic podría no tener esquemas aún
# Esto es normal en la primera ejecución
# Crea una transacción para generar el primer evento

# O verifica que Schema Registry esté conectado a Kafka
docker-compose logs schema-registry | grep "KafkaStore"
```

---

## Referencias

- [Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)
- [Kafka UI Features](https://docs.kafkaui.provectus.io/)
- [GraphQL Queries & Mutations](https://graphql.org/learn/queries/)
