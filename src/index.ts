import {
  ApolloServer,
  makeRemoteExecutableSchema,
  mergeSchemas,
} from 'apollo-server'
import { GraphQLSchema } from 'graphql'
import { HttpLink } from 'apollo-link-http'
import { importSchema } from "graphql-import"
import { fetch } from 'cross-fetch' // https://github.com/apollographql/apollo-link/issues/513
import { IncomingMessage, ServerResponse } from 'http'
import { resolvers } from './resolvers'

export interface Context {
  req: IncomingMessage,
  res: ServerResponse,
  prismaSchema: GraphQLSchema,
  prismaLink: HttpLink,
}

const prismaLink = new HttpLink({
  fetch: fetch,
  uri: 'http://localhost:4466',
});

const prismaSchema = makeRemoteExecutableSchema({
  link: prismaLink,
  schema: importSchema('src/generated/prisma.graphql'),
});

const server = new ApolloServer({
  schema: mergeSchemas({
    schemas: [
      prismaSchema,
      importSchema('src/schema.graphql'),
    ],
    resolvers,
  }),
  context: async ({ req, res }): Promise<Context> => {
    return { req, res, prismaSchema, prismaLink }
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
