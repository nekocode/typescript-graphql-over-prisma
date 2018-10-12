import {
  ApolloServer,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
} from 'apollo-server'
import { HttpLink } from 'apollo-link-http'
import { importSchema } from "graphql-import"
import { fetch } from 'cross-fetch' // https://github.com/apollographql/apollo-link/issues/513
import { resolvers } from './resolvers'
import { Context } from './universal'

const prismaLink = new HttpLink({
  fetch: fetch,
  uri: 'http://localhost:4466',
});

const prismaSchema = makeRemoteExecutableSchema({
  link: prismaLink,
  schema: importSchema('src/generated/prisma.graphql'),
});

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: importSchema('src/schema.graphql'),
    resolvers,
  }),
  context: async ({ req, res }): Promise<Context> => {
    return { req, res, prismaSchema, prismaLink }
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
