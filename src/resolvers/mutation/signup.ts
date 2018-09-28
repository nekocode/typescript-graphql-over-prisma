import { hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Context } from '../..'
import { APP_SECRET } from '../../utils'

export async function signup(root, { password, name, email }, ctx: Context) {
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
}