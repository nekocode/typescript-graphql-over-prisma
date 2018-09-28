import { Context } from '../..'
import { getUserId } from '../../utils'

export async function me(root, args, ctx: Context) {
    const user = await ctx.db.user({ id: getUserId(ctx) });
    return user;
}