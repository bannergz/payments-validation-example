import { Catch, ExceptionFilter, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { FastifyReply } from 'fastify';

@Catch(BadRequestException)
export class GraphQLExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    // For GraphQL, extract the underlying HTTP context
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const reply = ctx?.res as FastifyReply;
    if (reply && typeof reply.status === 'function') {
      reply.status(400);
    }
    // return exception to be formatted by GraphQL
    return exception;
  }
}