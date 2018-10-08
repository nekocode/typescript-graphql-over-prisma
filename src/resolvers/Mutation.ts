import { IResolvers, IGraphQLToolsResolveInfo } from 'apollo-server'
import { execute, makePromise } from 'apollo-link'
import gql from 'graphql-tag'
import { hash, compare } from 'bcrypt'
import { Context } from '..'
import { sign } from '../auth'
import { getSubschema } from '../utils'

export const Mutation: IResolvers = {
  signup: {
    async resolve(root, { email, password, name }, context: Context, info: IGraphQLToolsResolveInfo) {
      const hashedPassword = await hash(password, 10)

      const user = (await makePromise(execute(context.prismaLink, {
        query: gql`
        mutation {
          createUser(data: {email: "${email}", password: "${hashedPassword}", name: "${name}"}) {
            id,
            ${getSubschema(info, 'user')}
          }
        }
        `
      })) as any).data.createUser;

      return {
        token: sign({ userId: user.id }),
        user,
      }
    }
  },

  login: {
    async resolve(root, { email, password }, context: Context, info: IGraphQLToolsResolveInfo) {
      const user = (await makePromise(execute(context.prismaLink, {
        query: gql`
        query {
          user(where: {email: "${email}"}) {
            id, password,
            ${getSubschema(info, 'user')}
          }
        }
        `
      })) as any).data.user;

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
}
