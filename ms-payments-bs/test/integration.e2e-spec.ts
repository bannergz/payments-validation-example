import { KafkaContainer } from '@testcontainers/kafka';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module.js';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import axios from 'axios';
import { TransactionEventProducer } from '../src/transactions/services/transaction.producer.service.js';
import { TransactionValidationResponseConsumer } from '../src/transactions/event/transaction.validation.response.consumer.js';

let app: INestApplication;
let kafkaContainer;

beforeAll(async () => {
  // Setear variables de entorno ANTES de cualquier import de módulos
  process.env.DATABASE_URL = 'postgresql://testuser:testpass@localhost:5432/testdb?schema=public';
  process.env.KAFKA_BROKER = 'localhost:9092';
  process.env.KAFKA_BROKERS = 'localhost:9092';
  
  // Levantar contenedor de Kafka
  kafkaContainer = await new KafkaContainer('confluentinc/cp-kafka:7.5.0').start();
  const kafkaHost = kafkaContainer.getHost();
  const kafkaPort = kafkaContainer.getMappedPort(9093);
  console.log(`Kafka container started at ${kafkaHost}:${kafkaPort}`);
  const kafkaBroker = `${kafkaHost}:${kafkaPort}`;
  
  // Actualizar variables de entorno con los valores reales del contenedor
  process.env.KAFKA_BROKER = kafkaBroker;
  process.env.KAFKA_BROKERS = kafkaBroker;
  console.log(`Setting KAFKA_BROKER to: ${kafkaBroker}`);
  
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
    .overrideProvider(TransactionValidationResponseConsumer)
    .useValue(mockConsumerService)
    .compile();

  app = moduleFixture.createNestApplication(new FastifyAdapter());
  await app.init();
  await app.listen(0);
}, 60000);

afterAll(async () => {
  if (kafkaContainer) {
    await kafkaContainer.stop();
  }
  if (app) {
    await app.close();
  }
});

describe('AppController (e2e/integration)', () => {
  it('/health (GET)', async () => {
    // Obtener la URL base del servidor
    const server = app.getHttpServer();
    const address = server.address();
    let url;
    if (typeof address === 'string') {
      url = address;
    } else {
      url = `http://127.0.0.1:${address.port}`;
    }
    const res = await axios.get(`${url}/health`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('status');
    expect(res.data).toHaveProperty('message');
  });

  // Agrega aquí más tests de integración usando Kafka y Schema Registry mocks
});
