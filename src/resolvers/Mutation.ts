import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Context } from '..'
import { APP_SECRET } from '../utils'

export const Mutation = {
  signup: async (root, { password, name, email }, ctx: Context) => {
    const hashedPassword = await hash(password, 10)
    const user = await ctx.db.createUser({
      name,
      email,
      password: hashedPassword,
    })

    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    }
  },

  login: async (root, { email, password }, ctx: Context) => {
    const user = await ctx.db.user({ email })

    if (!user) {
      throw new Error(`No user found for email: ${email}`)
    }

    const valid = await compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }

    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    }
  },
}