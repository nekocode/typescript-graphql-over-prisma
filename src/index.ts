import { HttpLink } from "apollo-link-http";
import {
  ApolloServer,
  makeExecutableSchema,
} from "apollo-server";
// https://github.com/apollographql/apollo-link/issues/513
import { fetch } from "cross-fetch";
import { importSchema } from "graphql-import";
import { resolvers } from "./resolvers";
import { IContext } from "./universal";

const prismaLink = new HttpLink({
  fetch,
  uri: "http://localhost:4466",
});

const server = new ApolloServer({
  context: async ({ req, res }): Promise<IContext> => {
    return { req, res, prismaLink };
  },
  schema: makeExecutableSchema({
    resolvers,
    typeDefs: importSchema("src/schema.graphql"),
  }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
