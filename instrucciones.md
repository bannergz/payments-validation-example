# Yape Code Challenge

## Pre-Requirements

1. Having installed a package manager like:

- [homebrew](https://brew.sh/) for MAC
- [chocolatey](https://chocolatey.org/install) for Windows

2. Having **[nodejs](https://nodejs.org/en/download)** and **make** installed
   ```sh
   //Install make in MAC:
   brew install make
   //Install make in Windows:
   choco install make
   ```

## SetUp

1. Copy .env file

   ```sh
   cp .env.copy .env
   ```

2. Install dependencies
   ```sh
   npm install
   ```
3. Set-up containers environments
   ```sh
   make me-happy
   ```
4. You can test the service with yape-challenge.postman_collection.json in POSTMAN

5. To downstart services

   ```sh
   make me-down
   ```

6. Prisma Studio (http://localhost:51212/)

   ```sh
   npx prisma studio
   ```

7. Kafka UI (http://localhost:8080/ui).

## Ejecución de microservicios

Para correr los proyectos ejecutar (en cada proyecto, transaction y anti-fraud)

```sh
npm run start
```
