import { IResolvers } from "apollo-server";
import { Mutation } from "./Mutation";
import { Query } from "./Query";

export const resolvers: IResolvers = {
  Mutation,
  Query,
};
