import { GraphQLSchema } from 'graphql'
import { HttpLink } from 'apollo-link-http'
import { IncomingMessage, ServerResponse } from 'http'

export interface Context {
  req: IncomingMessage,
  res: ServerResponse,
  prismaSchema: GraphQLSchema,
  prismaLink: HttpLink,
}