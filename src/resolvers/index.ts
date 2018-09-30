import { IResolvers } from 'apollo-server'
import { Query } from './Query'
import { Mutation } from './Mutation'

export const resolvers: IResolvers = {
  Query,
  Mutation,
}
