import { verify, sign as _sign, Secret, SignOptions } from 'jsonwebtoken'
import { IGraphQLToolsResolveInfo, AuthenticationError, ForbiddenError } from 'apollo-server'
import { Context, APP_SECRET } from '../universal'

export function sign(
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret = APP_SECRET,
  options?: SignOptions
): string {
  return _sign(payload, secretOrPrivateKey, options)
}

export function getLoggedUserId(ctx: Context) {
  const auth = ctx.req.headers.authorization

  if (auth) {
    try {
      const token = auth.replace('Bearer ', '')
      const verifiedToken: any = verify(token, APP_SECRET)
      return verifiedToken && verifiedToken.userId
    } catch (ignored) {
    }
  }

  throw new AuthenticationError('Not authorized')
}

export function rootResolveFunctionForPrisma(root, args, context: Context, info: IGraphQLToolsResolveInfo) {
  if (info.operation.operation == 'query') {
    if (info.path.key === 'users') {
      throw new ForbiddenError('Operation forbidden')
    }
  } else if (info.operation.operation == 'mutation' ||
    info.operation.operation == 'subscription') {
      throw new ForbiddenError('Operation forbidden')
  }

  const userId = getLoggedUserId(context)
}