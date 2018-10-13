import {
  ApolloServer,
  makeExecutableSchema,
} from 'apollo-server';
import { HttpLink } from 'apollo-link-http';
import { importSchema } from "graphql-import";
// https://github.com/apollographql/apollo-link/issues/513
import { fetch } from 'cross-fetch';
import { resolvers } from './resolvers';
import { Context } from './universal';

const prismaLink = new HttpLink({
  fetch: fetch,
  uri: 'http://localhost:4466',
});

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: importSchema('src/schema.graphql'),
    resolvers,
  }),
  context: async ({ req, res }): Promise<Context> => {
    return { req, res, prismaLink }
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
