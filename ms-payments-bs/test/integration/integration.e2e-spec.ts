import { randomUUID } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { AppModule } from '../../src/app.module.js';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { TransactionEventProducer } from '../../src/transactions/services/transaction.producer.service.js';
import { TransactionValidationResponseConsumer } from '../../src/transactions/event/transaction.validation.response.consumer.js';
import { PrismaService } from '../../src/db/prisma.service.js';

// Set environment variables BEFORE any imports
process.env.DATABASE_URL =
  'postgresql://testuser:testpass@localhost:5432/testdb?schema=public';
process.env.KAFKA_BROKER = 'localhost:9092';
process.env.KAFKA_BROKERS = 'localhost:9092';
process.env.SCHEMA_REGISTRY_URL = 'http://localhost:8081';

let app: INestApplication | null = null;
let axios: AxiosInstance | null = null;
// Removed dynamic imports, now using static imports above
let mockProducerService: unknown;
let mockConsumerService: unknown;
let mockPrismaService: unknown;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown[]; path?: string[] }>;
}

interface CreateTransactionResponse {
  createTransaction: {
    transactionExternalId: string;
    transactionStatus: { name: string };
    value: number;
  };
}

interface RetrieveTransactionResponse {
  retrieveTransaction: {
    transactionExternalId: string;
    transactionStatus: { name: string };
    transactionType: { name: string };
    value: number;
  };
}

beforeAll(async () => {
  try {
    // Import axios dynamically to avoid top-level import before env vars
    axios = (await import('axios')).default;

    mockProducerService = {
      onModuleInit: async () => Promise.resolve(),
      publishTransactionValidationRequest: async () => Promise.resolve(),
    };

    mockConsumerService = {
      onModuleInit: async () => Promise.resolve(),
      start: async () => Promise.resolve(),
    };

    let storedTransactionId: string;
    mockPrismaService = {
      transaction: {
        create: () => {
          storedTransactionId = randomUUID();
          return {
            id: 1,
            externalId: storedTransactionId,
            transactionTypeId: 1,
            transactionStatusId: 1,
            accountDebitId: '11111111-1111-1111-1111-111111111111',
            accountCreditId: '22222222-2222-2222-2222-222222222222',
            value: 100.5,
            createdAt: new Date(),
            updatedAt: new Date(),
            transactionType: { id: 1, name: 'Payment' },
            transactionStatus: { id: 1, name: 'Pending' },
          };
        },
        findUnique: () => ({
          id: 1,
          externalId: storedTransactionId,
          transactionTypeId: 1,
          transactionStatusId: 1,
          accountDebitId: '11111111-1111-1111-1111-111111111111',
          accountCreditId: '22222222-2222-2222-2222-222222222222',
          value: 100.5,
          createdAt: new Date(),
          updatedAt: new Date(),
          transactionType: { id: 1, name: 'Payment' },
          transactionStatus: { id: 1, name: 'Pending' },
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TransactionEventProducer)
      .useValue(mockProducerService)
      .overrideProvider(TransactionValidationResponseConsumer)
      .useValue(mockConsumerService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.listen(0);
    // Wait for complete initialization
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('✓ NestJS app initialized');
  } catch (error) {
    console.error('✗ Failed to initialize app:', error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  if (app) {
    try {
      await app.close();
      console.log('✓ App closed');
    } catch (error) {
      console.warn('Failed to close app:', error);
    }
  }
});

describe('AppController (e2e/integration)', () => {
  it('/health (GET)', async () => {
    if (!app || !axios) throw new Error('App or axios not initialized');
    const server = app.getHttpServer() as import('http').Server;
    const addressInfo = server.address();
    let url: string;
    if (typeof addressInfo === 'string') {
      url = addressInfo;
    } else if (
      addressInfo &&
      typeof addressInfo === 'object' &&
      'port' in addressInfo
    ) {
      url = `http://127.0.0.1:${(addressInfo as { port: number }).port}`;
    } else {
      url = 'http://127.0.0.1:3000';
    }
    const res = await axios.get<{ status: string; message: string }>(
      `${url}/health`,
    );
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('status');
    expect(res.data).toHaveProperty('message');
  });

  it('mutation createTransaction y query retrieveTransaction', async () => {
    if (!app || !axios) throw new Error('App or axios not initialized');
    const server = app.getHttpServer() as import('http').Server;
    const addressInfo = server.address();
    let url: string;
    if (typeof addressInfo === 'string') {
      url = addressInfo;
    } else if (
      addressInfo &&
      typeof addressInfo === 'object' &&
      'port' in addressInfo
    ) {
      url = `http://127.0.0.1:${(addressInfo as { port: number }).port}`;
    } else {
      url = 'http://127.0.0.1:3000';
    }
    console.log(`Testing at URL: ${url}`);

    // 1. Execute createTransaction mutation
    const mutation = `
      mutation CreateTransaction($input: CreateTransactionInput!) {
        createTransaction(createTransactionInput: $input) {
          transactionExternalId
          transactionStatus { name }
          value
        }
      }
    `;

    const variables = {
      input: {
        accountExternalIdDebit: '11111111-1111-1111-1111-111111111111',
        accountExternalIdCredit: '22222222-2222-2222-2222-222222222222',
        transferTypeId: 1,
        value: 100.5,
      },
    };

    const resMutation = await axios.post<
      GraphQLResponse<CreateTransactionResponse>
    >(
      `${url}/graphql`,
      { query: mutation, variables },
      { headers: { 'Content-Type': 'application/json' } },
    );

    expect(resMutation.status).toBe(200);
    expect(resMutation.data).toBeDefined();
    if (resMutation.data?.errors) {
      console.error('GraphQL Errors:', resMutation.data.errors);
    }
    expect(resMutation.data?.data).toBeDefined();
    expect(resMutation.data?.data?.createTransaction).toBeDefined();
    expect(resMutation.data?.data?.createTransaction).toHaveProperty(
      'transactionExternalId',
    );

    const externalId =
      resMutation.data?.data?.createTransaction.transactionExternalId;

    console.log(`Transaction created with ID: ${externalId}`);

    // 2. Query the transaction with retrieveTransaction query
    const query = `
      query RetrieveTransaction($externalId: String!) {
        retrieveTransaction(externalId: $externalId) {
          transactionExternalId
          transactionStatus { name }
          transactionType { name }
          value
        }
      }
    `;

    const resQuery = await axios.post<
      GraphQLResponse<RetrieveTransactionResponse>
    >(
      `${url}/graphql`,
      { query, variables: { externalId } },
      { headers: { 'Content-Type': 'application/json' } },
    );

    expect(resQuery.status).toBe(200);
    expect(resQuery.data?.data).toBeDefined();
    if (resQuery.data?.errors) {
      console.error('GraphQL Query Errors:', resQuery.data.errors);
    }
    expect(resQuery.data?.data?.retrieveTransaction).toBeDefined();

    const retrieved = resQuery.data?.data?.retrieveTransaction;
    expect(retrieved?.transactionExternalId).toBe(externalId);
    expect(retrieved?.value).toBe(100.5);
    expect(retrieved?.transactionStatus.name).toBe('Pending');
    expect(retrieved?.transactionType.name).toBe('Payment');
  });
});
