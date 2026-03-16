import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module.js';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import axios from 'axios';
import { TransactionEventProducer } from '../src/frauds/services/transaction.producer.service.js';
import { TransactionRequestConsumer } from '../src/frauds/event/transaction.request.consumer.js';

let kafkaContainer: any = null;
let app: INestApplication;

beforeAll(async () => {
  // Setear variables de entorno ANTES de cualquier import de módulos
  process.env.DATABASE_URL =
    'postgresql://testuser:testpass@localhost:5432/testdb?schema=public';
  process.env.KAFKA_BROKER = 'localhost:9092';
  process.env.KAFKA_BROKERS = 'localhost:9092';

  try {
    // Levantar contenedor de Kafka

    const { KafkaContainer: KCont } =
      (await import('@testcontainers/kafka')) as {
        KafkaContainer: new (image: string) => {
          start: () => Promise<{
            getHost: () => string;
            getMappedPort: (p: number) => number;
          }>;
        };
      };

    const container = new KCont('confluentinc/cp-kafka:7.5.0');

    kafkaContainer = await container.start();
    if (kafkaContainer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const kafkaHost = kafkaContainer.getHost();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const kafkaPort = kafkaContainer.getMappedPort(9093);
      console.log(`Kafka container started at ${kafkaHost}:${kafkaPort}`);
      const kafkaBroker = `${kafkaHost}:${kafkaPort}`;

      // Actualizar variables de entorno con los valores reales del contenedor
      process.env.KAFKA_BROKER = kafkaBroker;
      process.env.KAFKA_BROKERS = kafkaBroker;
      console.log(`Setting KAFKA_BROKER to: ${kafkaBroker}`);
    }
  } catch (error) {
    console.warn('Failed to start Kafka container:', error);
  }

  // Crear el módulo con mocks para los servicios que se conectan a Kafka
  const mockProducerService = {
    onModuleInit: async () => Promise.resolve(),
    send: async () => Promise.resolve(),
  };

  const mockConsumerService = {
    onModuleInit: async () => Promise.resolve(),
    start: async () => Promise.resolve(),
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(TransactionEventProducer)
    .useValue(mockProducerService)
    .overrideProvider(TransactionRequestConsumer)
    .useValue(mockConsumerService)
    .compile();

  app = moduleFixture.createNestApplication(new FastifyAdapter());
  await app.init();
  await app.listen(0);
}, 60000);

afterAll(async () => {
  if (kafkaContainer) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await kafkaContainer.stop();
    } catch (error) {
      console.warn('Failed to stop Kafka container:', error);
    }
  }
  if (app) {
    await app.close();
  }
});

describe('AppController (e2e/integration)', () => {
  it('/health (GET)', async () => {
    // Obtener la URL base del servidor
    const server = app.getHttpServer() as {
      address: () => string | { port: number };
    };
    const address = server.address();
    let url: string;
    if (typeof address === 'string') {
      url = address;
    } else if (
      typeof address === 'object' &&
      address !== null &&
      'port' in address
    ) {
      url = `http://127.0.0.1:${(address as Record<string, number>).port}`;
    } else {
      url = 'http://127.0.0.1:3001';
    }

    const res = await axios.get(`${url}/health`);

    expect(res.status).toBe(200);

    expect(res.data).toHaveProperty('status');

    expect(res.data).toHaveProperty('message');
  });

  // Agrega aquí más tests de integración usando Kafka y Schema Registry mocks
});
