import { verify } from 'jsonwebtoken'
import { GraphQLResolveInfo, SelectionNode, FieldNode, FragmentSpreadNode, InlineFragmentNode, FragmentDefinitionNode, print } from 'graphql'
import { Context } from '.'

export const APP_SECRET = 'test'

class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

export function getUserId(ctx: Context) {
  const auth = ctx.req.headers.authorization

  if (auth) {
    const token = auth.replace('Bearer ', '')
    const verifiedToken: any = verify(token, APP_SECRET)
    return verifiedToken && verifiedToken.userId
  }

  throw new AuthError()
}

export function getSubschema(info: GraphQLResolveInfo, fieldName: string): string {
  let queryFields = ''
  const subNode = searchNode(fieldName, info)
  if (subNode) {
    const userSchema = print(subNode)
    queryFields = userSchema.slice(
      userSchema.indexOf('{') + 1,
      userSchema.lastIndexOf('}') - 1)
  }
  return queryFields
}

export function searchNode(tragetName: string, info: GraphQLResolveInfo): SelectionNode {
  const fieldNodes = info && info.fieldNodes
  if (fieldNodes) {
    return searchNodeFromAst(tragetName, fieldNodes, info.fragments)
  }
  return null
}

function searchNodeFromAst(
  tragetName: string,
  asts: SelectionNode | ReadonlyArray<SelectionNode>,
  fragments?: { [key: string]: FragmentDefinitionNode }
): SelectionNode {
  fragments = fragments || {}
  asts = Array.isArray(asts) ? asts : [asts]

  var rlt: SelectionNode = null
  for (let val of asts) {
    const kind = val.kind

    if (kind === 'Field') {
      const field = val as FieldNode
      const name = field.name.value
      if (tragetName === name) {
        return field
      }

      if (field.selectionSet) {
        rlt = searchNodeFromAst(tragetName, field.selectionSet.selections, fragments)
      }

    } else if (kind === 'FragmentSpread') {
      const name = (val as FragmentSpreadNode).name.value
      if (tragetName === name) {
        return val
      }

      const fragment = fragments[name]
      rlt = searchNodeFromAst(tragetName, fragment.selectionSet.selections, fragments)

    } else if (kind === 'InlineFragment') {
      const fragment = val as InlineFragmentNode
      rlt = searchNodeFromAst(tragetName, fragment.selectionSet.selections, fragments)
    }

    if (rlt) {
      return rlt
    }
  }

  return rlt
}