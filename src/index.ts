import { ApolloServer, gql } from 'apollo-server'
import { importSchema } from "graphql-import";
import { IncomingMessage, ServerResponse } from 'http'
import { Prisma, prisma as db } from './generated/prisma-client'
import { resolvers } from './resolvers'


export interface Context {
  req: IncomingMessage,
  res: ServerResponse,
  db: Prisma,
}

const server = new ApolloServer({
  typeDefs: importSchema('src/schema.graphql'),
  resolvers,
  context: async ({ req, res }): Promise<Context> => {
    return { req, res, db }
  },
} as any)

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
