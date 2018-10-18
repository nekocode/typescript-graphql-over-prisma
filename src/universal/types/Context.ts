import { HttpLink } from "apollo-link-http";
import { IncomingMessage, ServerResponse } from "http";

export interface IContext {
  req: IncomingMessage;
  res: ServerResponse;
  prismaLink: HttpLink;
}
