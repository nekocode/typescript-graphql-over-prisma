import { parse } from 'graphql';
import { execute, makePromise, GraphQLRequest } from 'apollo-link';
import { Context } from '../universal'

export async function queryPrisma(
  context: Context,
  querySchema: string
): Promise<{ [key: string]: any }> {
  return (await makePromise(execute(context.prismaLink, {
    query: parse(querySchema),
  })) as any).data;
}

export async function rawQueryPrisma(
  context: Context,
  operation: GraphQLRequest
): Promise<{ [key: string]: any }> {
  return (await makePromise(execute(context.prismaLink, operation)) as any).data;
}