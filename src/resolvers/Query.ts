import { IResolvers, IGraphQLToolsResolveInfo } from 'graphql-tools'
import { Context } from '..'
import { getLoggedUserId } from '../auth'

export const Query: IResolvers = {
  me: {
    async resolve(root, args, context: Context, info: IGraphQLToolsResolveInfo) {
      const loggedUserId = getLoggedUserId(context);
      return await info.mergeInfo.delegateToSchema({
        schema: context.prismaSchema,
        operation: 'query',
        fieldName: 'user',
        args: {
          where: { id: loggedUserId },
        },
        context,
        info,
      });
    }
  }
}