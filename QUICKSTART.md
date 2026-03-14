# 🚀 Quick Start Guide

Quick guide to launch the full project with Schema Registry.

## Prerequisites

1. Install a package manager:

- [homebrew](https://brew.sh/) for Mac
- [chocolatey](https://chocolatey.org/install) for Windows

2. Install **[Node.js](https://nodejs.org/en/download)** and **make**:

```sh
# For Mac:
brew install make
# For Windows:
choco install make
```

3. Make sure you have Docker and Docker Compose:

```sh
docker --version      # Should be 20.10+
docker-compose --version  # Should be 1.29+
```

4. Copy the environment file per service folder:

```sh
cp .env.example .env
```

5. Install dependencies:

```sh
npm install
```

## Deploy the Application

1. Start all services and infrastructure:

```sh
make me-happy
```

2. Wait for all services to be up (about 30-60 seconds). You can check status with:

```sh
docker-compose ps
docker-compose logs -f
```

3. Access the main services:

| Service             | URL                           | Description                   |
| ------------------- | ----------------------------- | ----------------------------- |
| **GraphQL API**     | http://localhost:3000/graphql | Create and query transactions |
| **Kafka UI**        | http://localhost:8080         | Monitor topics and messages   |
| **Schema Registry** | http://localhost:8081         | Manage schemas                |
| **Health Check**    | http://localhost:3000/health  | App health status             |

---

## First API Attempt

### 1. Create a transaction

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createTransaction(input: { accountExternalIdDebit: \"550e8400-e29b-41d4-a716-446655440000\" accountExternalIdCredit: \"550e8400-e29b-41d4-a716-446655440001\" transferTypeId: 1 value: 500 }) { transactionExternalId transactionStatus { name } } }"
  }'
```

### 2. Query the transaction

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getTransaction(transactionExternalId: \"<ID-FROM-STEP-1>\") { transactionExternalId value transactionStatus { name } } }"
  }'
```

### 3. View the message in Kafka

- Go to http://localhost:8080
- Go to **Topics** → `transaction-validation-request`
- You will see the published message

---

## Stop Everything

```bash
# Stop services (keep data)
docker-compose stop

# Stop and remove (keep data)
docker-compose down

# Stop, remove and delete data
docker-compose down -v

# Stop and remove everything in a single command
make me-down
```

---

## Local Development

If you want to develop with hot-reload:

```bash
# 1. In another terminal, go to ms-payments-bs
cd ms-payments-bs

# 2. Initialize Infraestructure, schema, topics, db
make me-happy

# 3. Install dependencies
npm install

# 4. Start in watch mode
npm run start:dev

# 5. In another terminal, go to ms-frauds-bs
cd ../ms-frauds-bs

# 6. Install dependencies
npm install

# 7. Start in watch mode
npm run start:dev
```

---

## Next Step

Continue reading [README.md](README.md) for full documentation.

Done! 🎉 🚀
