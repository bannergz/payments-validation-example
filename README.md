# Yape Code Challenge 🚀

**Sistema de transacciones financieras con validación anti-fraude mediante Kafka + Schema Registry**

## Tabla de Contenidos

- [Problema](#problema)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Levantar Servicios](#levantar-servicios)
- [Endpoints API](#endpoints-api)
- [Schema Registry](#schema-registry)
- [Monitoreo](#monitoreo)

---

## Problema

Cada vez que se crea una nueva transacción financiera, debe ser validada por un microservicio anti-fraude. El sistema cuenta con tres estados de transacción:

- ✅ **Pending**: Estado inicial de la transacción
- ✅ **Approved**: Transacción aprobada
- ❌ **Rejected**: Transacción rechazada

**Regla de negocio**: Toda transacción con valor mayor a 1000 debe ser rechazada.

```mermaid
  flowchart LR
    Transaction -- Save Transaction with pending Status --> transactionDatabase[(Database)]
    Transaction --Send transaction Created event--> Anti-Fraud
    Anti-Fraud -- Send transaction Status Approved event--> Transaction
    Anti-Fraud -- Send transaction Status Rejected event--> Transaction
    Transaction -- Update transaction Status event--> transactionDatabase[(Database)]
```

---

## Stack Tecnológico

| Componente          | Tecnología                |
| ------------------- | ------------------------- |
| **Runtime**         | Node.js                   |
| **Framework**       | NestJS                    |
| **ORM**             | Prisma                    |
| **Base de Datos**   | PostgreSQL                |
| **Message Broker**  | Apache Kafka              |
| **Schema Registry** | Confluent Schema Registry |
| **GraphQL**         | Apollo Server             |
| **Monitoreo**       | Kafka UI                  |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│           MS-Payments-BS (NestJS App)               │
│  ┌─────────────────────────────────────────────┐    │
│  │  GraphQL Server (Port 3000)                 │    │
│  │  - Create Transaction                       │    │
│  │  - Get Transaction                          │    │
│  │  - GraphQL Queries & Mutations              │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
           │
           │ (Kafka Events)
           ▼
┌─────────────────────────────────────────────────────┐
│      Kafka Broker (Port 9092)                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  Topic: transaction-validation-request      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
           │
           │ (Schema Validation)
           ▼
┌─────────────────────────────────────────────────────┐
│   Schema Registry (Port 8081)                       │
│  - Validates message schemas                        │
│  - Manages schema versions                          │
│  - Central schema repository                        │
└─────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
app-nodejs-codechallenge/
├── docker-compose.yml                 # Orquestación de todos los servicios
├── README.md                          # Este archivo
├──
├── schema-registry/                   # Servicio Schema Registry
│   ├── Dockerfile
│   └── README.md
│
└── ms-payments-bs/                    # Aplicación principal
    ├── docker-compose.yml             # Config opcional para ejecutar localmente
    ├── Dockerfile
    ├── package.json
    ├── prisma.config.ts
    ├── tsconfig.json
    ├── src/
    │   ├── app.module.ts
    │   ├── main.ts
    │   ├── schema.gql
    │   ├── transactions/
    │   │   ├── transaction.resolver.ts
    │   │   ├── transaction.service.ts
    │   │   ├── event/
    │   │   │   ├── transaction-validation-request.event.ts
    │   │   │   ├── transaction-validation-request.schema.ts  # ← SCHEMA USADO
    │   │   │   └── transaction.producer.service.ts
    │   │   └── ...
    │   ├── db/
    │   │   ├── prisma.module.ts
    │   │   └── prisma.service.ts
    │   └── health/
    │       └── health.controller.ts
    └── prisma/
        ├── schema.prisma
        └── migrations/
```

---

## Requisitos

- 🐳 **Docker Desktop** (versión 20.10+)
- 🐳 **Docker Compose** (versión 1.29+)
- 💾 **Espacio disco**: Mínimo 5GB
- 🔌 **Puertos disponibles**: 3000, 5432, 8080, 8081, 9092, 2181

### Verificar instalación

```bash
docker --version
docker-compose --version
```

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
cd /path/to/app-nodejs-codechallenge
```

### 2. Estructura de carpetas

Asegúrate de que el proyecto tenga esta estructura:

```bash
ls -la
# Deberías ver:
# docker-compose.yml
# ms-payments-bs/
# schema-registry/
# README.md
```

---

## Levantar Servicios

### 🚀 Opción 1: TODOS los servicios (Recomendado)

Levanta la infraestructura completa con un solo comando:

```bash
docker-compose up -d
```

**Servicios que se inician:**

- ✅ PostgreSQL (Port 5432)
- ✅ Zookeeper (Port 2181)
- ✅ Kafka (Port 9092)
- ✅ Schema Registry (Port 8081)
- ✅ Kafka UI (Port 8080)
- ✅ MS-Payments-BS (Port 3000)

**Verificar que todo está levantado:**

```bash
docker-compose ps
```

**Ver logs de todos los servicios:**

```bash
docker-compose logs -f
```

**Ver logs de un servicio específico:**

```bash
docker-compose logs -f ms-payments-bs
docker-compose logs -f schema-registry
docker-compose logs -f kafka
```

---

### 🔧 Opción 2: Servicios de Infraestructura (sin app)

Si quieres desarrollar localmente pero tener la infraestructura en Docker:

```bash
# Levanta solo la infraestructura
docker-compose up -d postgres mongo zookeeper kafka schema-registry kafka-ui

# Luego en otra terminal, desde ms-payments-bs/:
cd ms-payments-bs
npm install
npm run db:generate
npm run start:dev
```

---

### 🏗️ Opción 3: Servicio individual

Levanta solo un servicio específico (para testing):

```bash
# Solo Schema Registry
docker-compose up schema-registry

# Solo Kafka e infraestructura
docker-compose up kafka schema-registry

# Solo MS-Payments-BS (requiere que otros ya estén corriendo)
docker-compose up ms-payments-bs
```

---

### ⛔ Detener Servicios

```bash
# Parar todos los servicios (mantiene datos)
docker-compose stop

# Parar y eliminar contenedores (mantiene datos)
docker-compose down

# Parar, eliminar contenedores Y volúmenes (ELIMINA DATOS)
docker-compose down -v
```

---

## Endpoints API

### Health Check

```bash
curl http://localhost:3000/health
```

### GraphQL Endpoint

```
http://localhost:3000/graphql
```

### Query: Obtener una transacción

```graphql
query {
  getTransaction(
    transactionExternalId: "550e8400-e29b-41d4-a716-446655440000"
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

### Mutation: Crear una transacción

```graphql
mutation {
  createTransaction(
    input: {
      accountExternalIdDebit: "550e8400-e29b-41d4-a716-446655440000"
      accountExternalIdCredit: "550e8400-e29b-41d4-a716-446655440001"
      transferTypeId: 1
      value: 500
    }
  ) {
    transactionExternalId
    transactionStatus {
      name
    }
    value
    createdAt
  }
}
```

---

## Schema Registry

### Ver esquemas registrados

```bash
curl http://localhost:8081/subjects
```

### Registrar un nuevo esquema

```bash
curl -X POST http://localhost:8081/subjects/transaction-validation-request-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schema": "{\"type\":\"record\",\"name\":\"TransactionValidationRequest\",\"fields\":[...]}"
  }'
```

### Obtener esquema por ID

```bash
curl http://localhost:8081/schemas/ids/1
```

### Obtener todas las versiones de un esquema

```bash
curl http://localhost:8081/subjects/transaction-validation-request-value/versions
```

---

## Monitoreo

### Kafka UI

Accede a **Kafka UI** para monitorear topics, particiones y mensajes:

```
http://localhost:8080
```

**Características:**

- Ver todos los topics y particiones
- Inspeccionar mensajes en los topics
- Ver schemas registrados
- Monitoreo de consumer groups

### Schema Registry UI (via Kafka UI)

En Kafka UI, ve a la sección **Schema Registry** para ver los esquemas registrados.

---

## Variables de Entorno

### MS-Payments-BS

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/payments_db
KAFKA_BROKER=kafka:29092
SCHEMA_REGISTRY_URL=http://schema-registry:8081
PORT=3000
```

### Schema Registry

```env
SCHEMA_REGISTRY_HOST_NAME=schema-registry
SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS=kafka:29092
SCHEMA_REGISTRY_LISTENERS=http://0.0.0.0:8081
```

---

## Troubleshooting

### Problema: Puerto ya en uso

```bash
# Encontrar qué proceso usa el puerto (ejemplo: 3000)
# En Linux/Mac:
lsof -i :3000

# En Windows CMD:
netstat -ano | findstr :3000

# Solución: Cambiar puerto en docker-compose.yml
# O matar el proceso que usa ese puerto
```

### Problema: Schema Registry no conecta a Kafka

```bash
# Verificar logs
docker-compose logs schema-registry

# Reiniciar schema-registry
docker-compose restart schema-registry

# O recrearlo
docker-compose up -d --force-recreate schema-registry
```

### Problema: Base de datos no migrada

```bash
# Ejecutar migraciones
docker-compose exec ms-payments-bs npm run db:generate

# O acceder al contenedor y ejecutar manualmente
docker-compose exec ms-payments-bs npx prisma migrate dev
```

### Problema: Contenedores no inician

```bash
# Ver logs detallados
docker-compose logs -f

# Verificar que los volúmenes existan
docker volume ls

# Reconstruir imágenes
docker-compose up -d --build
```

---

## Desarrollo Local

### Usar infraestructura de Docker, app local

```bash
# 1. Levanta solo infraestructura
docker-compose up -d postgres zookeeper kafka schema-registry

# 2. En otra terminal, dentro de ms-payments-bs/
cd ms-payments-bs
npm install
npm run db:generate
npm run start:dev
```

---

## Testing

### E2E Tests

```bash
# Dentro de ms-payments-bs/
npm run test:e2e
```

### Unit Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:cov
```

---

## Referencias Útiles

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Confluent Schema Registry](https://docs.confluent.io/platform/current/schema-registry/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Apache Kafka](https://kafka.apache.org/documentation/)

---

## Contribuyendo

Si encuentras issues o tienes sugerencias, abre un pull request o issue.

**Happy Coding! 🎉**
