import { IResolvers } from 'apollo-server'

import { Query } from './query'
import { Mutation } from './mutation'

export const resolvers: IResolvers = {
  Query,
  Mutation,
}
