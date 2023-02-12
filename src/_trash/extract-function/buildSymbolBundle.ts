import { SymbolFlags } from "ts-morph";

import type { Identifier, Node } from "ts-morph";

type TSymbolNodeInfoBundle = {
  declarationSourceFilePath: string;
  definitionNodeLineText: string;
  definitionNodePosEnd: number;
  definitionNodePosStart: number;
  definitionNodeText: string;
  identifierNode: Node;
  identifierNodeEnd: number;
  identifierNodeKind: string;
  identifierNodeLineText: string;
  identifierNodeSourceFilePath: string;
  identifierNodeStart: number;
  identifierNodeText: string;
  identifierSymbolName: string;
  symbbolTypeText: string;
  symbolFlags: SymbolFlags;
  symbolFlagsText: string;
  symbolTypeAtLocationText: string;
};

export const buildSymbolBundle = (
  identifierNode: Identifier
): TSymbolNodeInfoBundle => {
  const identifierNodeSourceFilePath = identifierNode
    .getSourceFile()
    .getFilePath();
  const identifierNodeText = identifierNode.getText();
  const identifierNodeStart = identifierNode.getStart();
  const identifierNodeEnd = identifierNode.getEnd();
  const identifierNodeKind = identifierNode.getKindName();
  const identifierNodeLineText = identifierNode
    .getSourceFile()
    .getText()
    .split("\n")[identifierNode.getEndLineNumber() - 1];

  // defintion stuff
  // defintion stuff
  // defintion stuff
  // defintion stuff
  const LANGSERVICE = identifierNode.getProject().getLanguageService();
  const defintionNode = LANGSERVICE.getDefinitions(identifierNode)[0].getNode();
  const identifierSymbol = identifierNode.getSymbol();
  const identifierSymbolName = identifierSymbol.getName();
  const definitionNode = defintionNode;
  const definitionNodeText = definitionNode.getText();
  const definitionNodePosStart = definitionNode.getStart();
  const definitionNodePosEnd = definitionNode.getEnd();
  const declarationSourceFilePath = definitionNode
    .getSourceFile()
    .getFilePath();
  const definitionNodeLineText = definitionNode
    .getSourceFile()
    .getText()
    .split("\n")[definitionNode.getEndLineNumber() - 1];
  const symbolTypeAtLocation =
    identifierSymbol.getTypeAtLocation(identifierNode);
  const symbolTypeAtLocationText = symbolTypeAtLocation.getText();
  const symbolType = identifierSymbol.getDeclaredType();
  const symbolFlags = identifierSymbol.getFlags();
  const symbolFlagsText = SymbolFlags[identifierSymbol.getFlags()];
  const symbbolTypeText = symbolType.getText();

  const bundle = {
    declarationSourceFilePath,
    definitionNodeLineText,
    definitionNodePosEnd,
    definitionNodePosStart,
    definitionNodeText,
    identifierNode,
    identifierNodeEnd,
    identifierNodeKind,
    identifierNodeLineText,
    identifierNodeSourceFilePath,
    identifierNodeStart,
    identifierNodeText,
    identifierSymbolName,
    symbbolTypeText,
    symbolFlags,
    symbolFlagsText,
    symbolTypeAtLocationText,
  };
  return bundle;
};
