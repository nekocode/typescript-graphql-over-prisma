import { verify } from 'jsonwebtoken'
import { Context } from '.'

export const APP_SECRET = 'test'

class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

export function getUserId(ctx: Context) {
  const auth = ctx.req.headers.authorization

  if (auth) {
    const token = auth.replace('Bearer ', '')
    const verifiedToken: any = verify(token, APP_SECRET)
    return verifiedToken && verifiedToken.userId
  }

  throw new AuthError()
}
