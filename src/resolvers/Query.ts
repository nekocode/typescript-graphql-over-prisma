import { IResolvers } from "apollo-server";
import { GraphQLResolveInfo, print } from "graphql";
import { IContext } from "../universal";
import { getLoggedUserId, parseResolveInfo, queryPrisma } from "../utils";

export const Query: IResolvers = {
  me: {
    async resolve(root, args, context: IContext, info: GraphQLResolveInfo) {
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
        `,
      )).user;

      return user;
    },
  },

  posts: {
    async resolve(root, args, context: IContext, info: GraphQLResolveInfo) {
      const posts = (await queryPrisma(context, `
        {${print(info.fieldNodes[0])}}
        `,
      )).posts;

      return posts;
    },
  },
};
