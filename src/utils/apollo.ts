import { execute, GraphQLRequest, makePromise } from "apollo-link";
import { parse } from "graphql";
import { IContext } from "../universal";

export async function queryPrisma(
  context: IContext,
  querySchema: string,
): Promise<{ [key: string]: any }> {
  return (await makePromise(execute(context.prismaLink, {
    query: parse(querySchema),
  })) as any).data;
}

export async function rawQueryPrisma(
  context: IContext,
  operation: GraphQLRequest,
): Promise<{ [key: string]: any }> {
  return (await makePromise(execute(context.prismaLink, operation)) as any).data;
}
