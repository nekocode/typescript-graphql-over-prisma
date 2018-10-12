import { GraphQLResolveInfo, parse } from 'graphql';
import { IResolvers } from 'apollo-server';
import { hash, compare } from 'bcrypt';
import { Context } from '../universal';
import { ResolveInfoNode, sign, getLoggedUserId, queryPrisma } from '../utils';

export const Mutation: IResolvers = {
  signup: {
    async resolve(root, { email, password, name }, context: Context, info: GraphQLResolveInfo) {
      const {
        fields: userFields,
        usedFragments: userFragments,
      } = new ResolveInfoNode(info).child('user').print();
      const hashedPassword = await hash(password, 10);

      const user = (await queryPrisma(context, `
        mutation {
          createUser(data: {email: "${email}", password: "${hashedPassword}", name: "${name}"}) {
            id,
            ${userFields}
          }
        }
        ${userFragments}
        `
      ))['createUser'];

      return {
        token: sign({ userId: user.id }),
        user,
      };
    }
  },

  login: {
    async resolve(root, { email, password }, context: Context, info: GraphQLResolveInfo) {
      const {
        fields: userFields,
        usedFragments: userFragments,
      } = new ResolveInfoNode(info).child('user').print();

      const user = (await queryPrisma(context, `
        query {
          user(where: {email: "${email}"}) {
            id, password,
            ${userFields}
          }
        }
        ${userFragments}
        `
      ))['user'];

      if (!user) {
        throw new Error(`No user found for email: ${email}`);
      }

      const valid = await compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid password');
      }

      return {
        token: sign({ userId: user.id }),
        user,
      }
    }
  },

  createPost: {
    async resolve(root, { title, body, status }, context: Context, info: GraphQLResolveInfo) {
      const {
        fields: postFields,
        usedFragments: postFragments,
      } = new ResolveInfoNode(info).print();
      const loggedUserId = getLoggedUserId(context);

      const post = (await queryPrisma(context, `
        mutation {
          createPost(data: {title: "${title}", body: "${body}", status: ${status}, author: {connect: {id: "${loggedUserId}"}}}) {
            ${postFields}
          }
        }
        ${postFragments}
        `
      ))['createPost'];

      return post;
    }
  },

  deletePost: {
    async resolve(root, { id: postId }, context: Context, info: GraphQLResolveInfo) {
      const {
        fields: postFields,
        usedFragments: postFragments,
      } = new ResolveInfoNode(info).print();
      const loggedUserId = getLoggedUserId(context);

      const post = (await queryPrisma(context, `
        mutation {
          deletePost(where: {id: "${postId}"}) {
            ${postFields}
          }
        }
        ${postFragments}
        `
      ))['deletePost'];

      return post;
    }
  },
}
