import { Context } from '..'
import { getUserId, forwardTo } from '../utils'

export const Query = {
  me: async (root, args, ctx: Context) => {
    const user = await ctx.db.user({ id: getUserId(ctx) });
    return user;
  },

  posts: forwardTo('db'),
}