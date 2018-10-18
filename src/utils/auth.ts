import { AuthenticationError } from "apollo-server";
import { Secret, sign as _sign, SignOptions, verify } from "jsonwebtoken";
import { APP_SECRET, IContext } from "../universal";

export function sign(
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret = APP_SECRET,
  options?: SignOptions,
): string {
  return _sign(payload, secretOrPrivateKey, options);
}

export function getLoggedUserId(ctx: IContext) {
  const auth = ctx.req.headers.authorization;

  if (auth) {
    try {
      const token = auth.replace("Bearer ", "");
      const verifiedToken: any = verify(token, APP_SECRET);
      return verifiedToken && verifiedToken.userId;
    } catch (ignored) {
      // Do nothing
    }
  }
  throw new AuthenticationError("Not authorized");
}
