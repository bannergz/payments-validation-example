import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import {
  TransactionType,
  TransactionTypeId,
} from '../utils/transaction-type.enum.js';

export function IsValidTransferTypeId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTransferTypeId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: TransactionTypeId) {
          const validIds = Object.values(TransactionType).map((t) => t.id);
          return typeof value === 'number' && validIds.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          const validIds = Object.values(TransactionType).map((t) => t.id);
          return `${args.property} must be one of the following values: ${validIds.join(', ')}`;
        },
      },
    });
  };
}
