import { IResolvers, IGraphQLToolsResolveInfo } from 'graphql-tools'
import { Context } from '..'
import { getUserId } from '../utils'

export const Query: IResolvers = {
  me: {
    async resolve(root, args, context: Context, info: IGraphQLToolsResolveInfo) {
      return await info.mergeInfo.delegateToSchema({
        schema: context.prismaSchema,
        operation: 'query',
        fieldName: 'user',
        args: {
          where: { id: getUserId(context) },
        },
        context,
        info,
      })
    }
  }
}