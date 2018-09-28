import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Context } from '../..'
import { APP_SECRET } from '../../utils'

export async function login(root, { email, password }, ctx: Context) {
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
}