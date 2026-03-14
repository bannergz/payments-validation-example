import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Transaction Type' })
export class TransactionType {
  @Field({ description: 'Transaction Type ID' })
  id: number;
  @Field({ description: 'Transaction Type Name' })
  name: string;
}
