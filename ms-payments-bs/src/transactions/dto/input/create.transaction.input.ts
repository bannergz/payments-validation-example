import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsUUID } from "class-validator";
import { UUID_VERSION } from "../../../commons/constants.js";
import { IsValidTransferTypeId } from "../../../transactions/decorators/is-valid-transfer-type-id.decorator.js";

@InputType()
export class CreateTransactionInput {

  @Field({ description: 'Account External ID for Debit' })
  @IsUUID(UUID_VERSION, { message: 'accountExternalIdDebit must be a valid UUID' })
  accountExternalIdDebit: string;

  @Field({ description: 'Account External ID for Credit' })
  @IsUUID(UUID_VERSION, { message: 'accountExternalIdCredit must be a valid UUID' })
  accountExternalIdCredit: string;

  @Field({ description: 'Transfer Type ID' })
  @IsValidTransferTypeId({ message: 'transferTypeId must be a valid transaction type ID (1, 2, or 3)' })
  transferTypeId: number;

  @Field({ description: 'Transaction Value' })
  @IsNumber({}, { message: 'value must be a number' })
  value: number;

}