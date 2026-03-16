import { PrismaService } from '../../src/db/prisma.service.js';
import { jest } from '@jest/globals';

describe('PrismaService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Use global jest.resetModules()
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initialization', () => {
    it('should throw error when DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;

      expect(() => {
        new PrismaService();
      }).toThrow('DATABASE_URL environment variable is not set');
    });

    it('should be defined when DATABASE_URL is set', () => {
      process.env.DATABASE_URL =
        'postgresql://user:password@localhost:5432/test';

      const service = new PrismaService();
      expect(service).toBeDefined();
    });

    it('should instantiate with valid DATABASE_URL', () => {
      const connectionString = 'postgresql://user:pass@localhost:5432/mydb';
      process.env.DATABASE_URL = connectionString;

      const service = new PrismaService();
      expect(service.constructor.name).toBe('PrismaService');
    });
  });

  describe('error handling', () => {
    it('should throw error with specific message for missing DATABASE_URL', () => {
      delete process.env.DATABASE_URL;

      const errorFn = () => {
        new PrismaService();
      };

      expect(errorFn).toThrow('DATABASE_URL environment variable is not set');
    });

    it('should provide meaningful error message', () => {
      process.env.DATABASE_URL = undefined;

      expect(() => {
        new PrismaService();
      }).toThrow();
    });
  });

  describe('service properties', () => {
    it('should be injectable', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';

      const service = new PrismaService();
      expect(service).toBeDefined();
    });

    it('should have PrismaClient interface methods', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';

      const service = new PrismaService();
      expect(typeof service.$connect).toBe('function');
      expect(typeof service.$disconnect).toBe('function');
    });
  });
});
