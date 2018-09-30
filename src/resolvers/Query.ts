import { Context } from '..'
import { getUserId } from '../utils'

export const Query = {
  me: async (root, args, ctx: Context) => {
    const user = await ctx.db.user({ id: getUserId(ctx) });
    return user;
  },
}