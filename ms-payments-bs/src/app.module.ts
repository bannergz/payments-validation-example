import { Module } from '@nestjs/common';
import { join } from 'path';
import { HealthModule } from './health/health.module.js';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TransactionModule } from './transactions/transation.module.js';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      //debug: false,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    HealthModule,
    TransactionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
