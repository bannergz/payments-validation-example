import { validate } from 'class-validator';
import { IsValidTransferTypeId } from '../../../src/transactions/decorators/is-valid-transfer-type-id.decorator.js';
import { TransactionType } from '../../../src/transactions/utils/transaction-type.enum.js';
import type { TransactionTypeId } from '../../../src/transactions/utils/transaction-type.enum.js';

class TestDTO {
  @IsValidTransferTypeId()
  typeId: TransactionTypeId;
}

class TestDTOWithOptions {
  @IsValidTransferTypeId({ message: 'Custom error message' })
  typeId: TransactionTypeId;
}

describe('IsValidTransferTypeId Decorator', () => {
  describe('valid type ids', () => {
    it('should accept valid transaction type id: 1 (Payment)', async () => {
      const dto = new TestDTO();
      dto.typeId = TransactionType.Payment.id as TransactionTypeId;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid transaction type id: 2 (Remittance)', async () => {
      const dto = new TestDTO();
      dto.typeId = TransactionType.Remittance.id as TransactionTypeId;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid transaction type id: 3 (Refund)', async () => {
      const dto = new TestDTO();
      dto.typeId = TransactionType.Refund.id as TransactionTypeId;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('invalid type ids', () => {
    it('should reject invalid transaction type id: 99', async () => {
      const dto = new TestDTO();
      dto.typeId = 99 as TransactionTypeId;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isValidTransferTypeId).toBeDefined();
    });

    it('should reject non-numeric values', async () => {
      const dto = new TestDTO();
      (dto as unknown as Record<string, unknown>).typeId = 'invalid';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isValidTransferTypeId).toBeDefined();
    });

    it('should reject null values', async () => {
      const dto = new TestDTO();
      (dto as unknown as Record<string, unknown>).typeId = null;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isValidTransferTypeId).toBeDefined();
    });

    it('should reject undefined values', async () => {
      const dto = new TestDTO();
      (dto as unknown as Record<string, unknown>).typeId = undefined;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints?.isValidTransferTypeId).toBeDefined();
    });
  });

  describe('error messages', () => {
    it('should provide default error message with valid ids', async () => {
      const dto = new TestDTO();
      dto.typeId = 99 as TransactionTypeId;

      const errors = await validate(dto);
      expect(errors[0]?.constraints?.isValidTransferTypeId).toContain(
        '1, 2, 3',
      );
    });

    it('should use custom error message when provided', async () => {
      const dto = new TestDTOWithOptions();
      dto.typeId = 99 as TransactionTypeId;

      const errors = await validate(dto);
      expect(errors[0]?.constraints?.isValidTransferTypeId).toBe(
        'Custom error message',
      );
    });
  });
});
