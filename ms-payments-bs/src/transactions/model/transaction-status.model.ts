import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Transaction Status' })
export class TransactionStatus {
  @Field({ description: 'Transaction Status ID' })
  id: number;
  @Field({ description: 'Transaction Status Name' })
  name: string;
}
