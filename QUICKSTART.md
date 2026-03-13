# 🚀 Quick Start Guide

Guía rápida para levantar el proyecto completo con Schema Registry.

## 5 Pasos Rápidos

### 1. Verificar requisitos

```bash
docker --version      # Debe ser 20.10+
docker-compose --version  # Debe ser 1.29+
```

### 2. Navegar a la carpeta

```bash
cd /ruta/a/app-nodejs-codechallenge
```

### 3. Levantar TODOS los servicios

```bash
# Opción A: Con Docker Compose directamente
docker-compose up -d

# Opción B: Con el script helper (Linux/Mac)
chmod +x docker-helper.sh
./docker-helper.sh up

# Opción C: Con el script helper (Windows)
docker-helper.bat up
```

### 4. Esperar a que todo esté listo (30-60 segundos)

```bash
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# O con script (Linux/Mac)
./docker-helper.sh health

# O con script (Windows)
docker-helper.bat health
```

### 5. Acceder a los servicios

| Servicio            | URL                           | Descripción                     |
| ------------------- | ----------------------------- | ------------------------------- |
| **GraphQL API**     | http://localhost:3000/graphql | Crear y consultar transacciones |
| **Kafka UI**        | http://localhost:8080         | Monitorear topics y mensajes    |
| **Schema Registry** | http://localhost:8081         | Gestionar esquemas              |
| **Health Check**    | http://localhost:3000/health  | Estado de la app                |

---

## Primero Intento de API

### 1. Crear una transacción

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createTransaction(input: { accountExternalIdDebit: \"550e8400-e29b-41d4-a716-446655440000\" accountExternalIdCredit: \"550e8400-e29b-41d4-a716-446655440001\" transferTypeId: 1 value: 500 }) { transactionExternalId transactionStatus { name } } }"
  }'
```

### 2. Consultar la transacción

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getTransaction(transactionExternalId: \"<ID-DEL-PASO-1>\") { transactionExternalId value transactionStatus { name } } }"
  }'
```

### 3. Ver el mensaje en Kafka

- Accede a http://localhost:8080
- Ve a **Topics** → `transaction-validation-request`
- Verás el mensaje publicado

---

## Detener Todo

```bash
# Parar servicios (mantiene datos)
docker-compose stop

# Parar y eliminar (mantiene datos)
docker-compose down

# Parar, eliminar Y borrar datos
docker-compose down -v
```

---

## Desarrollo Local

Si quieres desarrollar con hot-reload:

```bash
# 1. Levanta solo infraestructura
docker-compose up -d postgres mongo zookeeper kafka schema-registry kafka-ui

# 2. En otra terminal, entra a ms-payments-bs
cd ms-payments-bs

# 3. Instala dependencias
npm install

# 4. Genera cliente Prisma
npm run db:generate

# 5. Inicia con watch
npm run start:dev
```

---

## Scripts Helper

### Linux/Mac

```bash
./docker-helper.sh help        # Ver todos los comandos
./docker-helper.sh up          # Levanta todo
./docker-helper.sh logs-app    # Ver logs de la app
./docker-helper.sh restart     # Reinicia
./docker-helper.sh down        # Detiene
```

### Windows

```batch
docker-helper.bat help      # Ver todos los comandos
docker-helper.bat up        # Levanta todo
docker-helper.bat logs-app  # Ver logs de la app
docker-helper.bat restart   # Reinicia
docker-helper.bat down      # Detiene
```

---

## Troubleshooting

### Error: "Ports already in use"

```bash
# Liberar puerto 3000
# Linux/Mac:
kill $(lsof -t -i :3000)

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Schema Registry no conecta

```bash
# Ver logs
docker-compose logs schema-registry

# Reiniciar
docker-compose restart schema-registry
```

### Red connection error

```bash
# Verificar redes
docker network ls

# Recrear todo
docker-compose down -v
docker-compose up -d
```

---

## Siguiente Paso

Sigue leyendo [README.md](README.md) para documentación completa.

¡Listo! 🎉
