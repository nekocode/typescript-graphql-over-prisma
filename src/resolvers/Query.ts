import { GraphQLResolveInfo, parse, print } from 'graphql';
import { IResolvers } from 'apollo-server';
import { Context } from '../universal';
import { parseResolveInfo, getLoggedUserId, queryPrisma } from '../utils';

export const Query: IResolvers = {
  me: {
    async resolve(root, args, context: Context, info: GraphQLResolveInfo) {
      const {
        childFields: userFields,
        usedFragments: userFragments,
      } = parseResolveInfo(info).print();
      const loggedUserId = getLoggedUserId(context);

      const user = (await queryPrisma(context, `
        query {
          user(where: {id: "${loggedUserId}"}) {
            ${userFields}
          }
        }
        ${userFragments}
        `
      ))['user'];

      return user;
    }
  },

  posts: {
    async resolve(root, args, context: Context, info: GraphQLResolveInfo) {
      const posts = (await queryPrisma(context, `
        {${print(info.fieldNodes[0])}}
        `
      ))['posts'];

      return posts;
    }
  },
}