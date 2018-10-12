import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLResolveInfo,
  ASTNode,
  SelectionNode,
  FieldNode,
  InlineFragmentNode,
  FragmentSpreadNode,
  FragmentDefinitionNode,
  Kind,
  GraphQLSkipDirective,
  GraphQLIncludeDirective,
  getDirectiveValues,
  typeFromAST,
  isAbstractType,
  print,
} from 'graphql';

export interface PrintResult {
  fields: string,
  usedFragments: string,
}

export class ResolveInfoNode {
  private readonly info: GraphQLResolveInfo;
  private readonly rootFields: FieldNode[];
  private readonly fields: FieldNode[];

  constructor(
    info: GraphQLResolveInfo,
    rootFields: FieldNode[] = null,
    returnType: GraphQLObjectType = null,
  ) {
    this.info = info;
    this.rootFields = rootFields || [info.fieldNodes[0]];

    this.fields = [];
    for (const rootField of this.rootFields) {
      const { fields } = collectFields(
        rootField,
        info.schema,
        info.variableValues,
        info.fragments,
        returnType,
      );

      this.fields.push(...fields);
    }
  }

  child(
    childNodeName: string,
    returnType: GraphQLObjectType = null
  ): ResolveInfoNode {
    const targetFields = this.fields
      .filter(field => getFieldEntryKey(field) === childNodeName);
    if (targetFields.length == 0) {
      throw Error(`Child node "${childNodeName} not found."`);
    }

    return new ResolveInfoNode(
      this.info,
      targetFields,
      returnType,
    );
  }

  print(): PrintResult {
    if (this.fields.length == 0) {
      return {
        fields: '',
        usedFragments: '',
      };
    }
    const allUsedFragments = this.fields
      .map(field => {
        return collectAllUsedFragments(
          field,
          this.info.schema,
          this.info.variableValues,
          this.info.fragments,
        );
      })
      .reduce((pV, cV) => mergeMap([pV, cV]));

    return {
      fields: printNodes(this.fields),
      usedFragments: printNodes(Array.from(allUsedFragments.values())),
    };
  }

  hasChild(childNodeName: string): boolean {
    for (const field of this.fields) {
      if (getFieldEntryKey(field) === childNodeName) {
        return true;
      }
    }
    return false;
  }
}

function printNodes(nodes: ASTNode[], separator: string = '\n'): string {
  if (nodes.length == 0) {
    return '';
  }
  return nodes
    .map(fragment => print(fragment))
    .reduce((pV, cV) => pV + separator + cV);
}

function collectAllUsedFragments(
  rootField: FieldNode,
  schema: GraphQLSchema,
  variableValues: { [variableName: string]: any },
  fragments: { [key: string]: FragmentDefinitionNode },
): Map<string, FragmentDefinitionNode> {
  let allUsedFragments: Map<string, FragmentDefinitionNode> = new Map();

  function collectUsedFragments(_rootField: FieldNode) {
    const {fields, usedFragments} = collectFields(
      _rootField,
      schema,
      variableValues,
      fragments
    );
    allUsedFragments = mergeMap([allUsedFragments, usedFragments]);

    for (const field of fields) {
      collectUsedFragments(field);
    }
  }
  collectUsedFragments(rootField);

  return allUsedFragments;
}

interface FieldsAndUsedFragments {
  fields: FieldNode[],
  usedFragments: Map<string, FragmentDefinitionNode>,
}

function collectFields(
  rootField: FieldNode,
  schema: GraphQLSchema,
  variableValues: { [variableName: string]: any },
  fragments: { [key: string]: FragmentDefinitionNode },
  runtimeType: GraphQLObjectType = null,
): FieldsAndUsedFragments {
  if (!rootField.selectionSet) {
    return {
      fields: [],
      usedFragments: new Map(),
    };
  }

  const usedFragments: Map<string, FragmentDefinitionNode> = new Map();
  const fields: FieldNode[] = [];

  function walk(selections: ReadonlyArray<SelectionNode>) {
    for (const selection of selections) {
      switch (selection.kind) {
        case Kind.FIELD:
          if (!shouldIncludeNode(selection, variableValues)) {
            continue;
          }
          fields.push(selection);
          break;
        case Kind.INLINE_FRAGMENT:
          if (
            !shouldIncludeNode(selection, selection) ||
            !doesFragmentConditionMatch(schema, selection, runtimeType)
          ) {
            continue;
          }
          walk(selection.selectionSet.selections);
          break;
        case Kind.FRAGMENT_SPREAD:
          const fragName = selection.name.value;
          if (
            usedFragments.has(fragName) ||
            !shouldIncludeNode(selection, variableValues)
          ) {
            continue;
          }
          const fragment = fragments[fragName];
          usedFragments.set(fragName, fragment);
          if (!fragment) {
            throw new Error(`Fragment ${fragName} was queried but not defined`);
          } else if (!doesFragmentConditionMatch(schema, fragment, runtimeType)) {
            continue;
          }
          walk(fragment.selectionSet.selections);
          break;
      }
    }
  }
  walk(rootField.selectionSet.selections);

  return {
    fields,
    usedFragments
  };
}

function shouldIncludeNode(node: FragmentSpreadNode | FieldNode | InlineFragmentNode, variableValues: { [key: string]: any }): boolean {
  const skip = getDirectiveValues(
    GraphQLSkipDirective,
    node,
    variableValues,
  );
  if (skip && skip.if === true) {
    return false;
  }

  const include = getDirectiveValues(
    GraphQLIncludeDirective,
    node,
    variableValues,
  );
  if (include && include.if === false) {
    return false;
  }
  return true;
}

function doesFragmentConditionMatch(
  schema: GraphQLSchema,
  fragment: FragmentDefinitionNode | InlineFragmentNode,
  type?: GraphQLObjectType,
): boolean {
  if (!type) {
    return true;
  }

  const typeConditionNode = fragment.typeCondition;
  if (!typeConditionNode) {
    return true;
  }
  const conditionalType = typeFromAST(schema, typeConditionNode);
  if (conditionalType === type) {
    return true;
  }
  if (isAbstractType(conditionalType)) {
    return schema.isPossibleType(conditionalType, type);
  }
  return false;
}

function getFieldEntryKey(node: FieldNode): string {
  return node.alias ? node.alias.value : node.name.value;
}

function mergeMap<K,V>(maps: Map<K, V>[]): Map<K, V> {
  const mergedMap: Map<K, V> = new Map();
  for (const map of maps) {
    for(const [k, v] of Array.from(map.entries())) {
      mergedMap.set(k, v);
    }
  }
  return mergedMap;
}
