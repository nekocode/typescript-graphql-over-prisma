import { verify, sign as _sign, Secret, SignOptions } from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server'
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
