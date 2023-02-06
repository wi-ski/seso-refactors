import { SymbolFlags } from "ts-morph";

import type { Identifier } from "ts-morph";

type TSymbolNodeInfoBundle = {
  declarationNodeLineText: string;
  declarationNodePosEnd: number;
  declarationNodePosStart: number;
  declarationNodeText: string;
  declarationSourceFilePath: string;
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
  const LANGSERVICE = identifierNode.getProject().getLanguageService();
  const defintionNode = LANGSERVICE.getDefinitions(identifierNode)[0].getNode();
  const identifierSymbol = identifierNode.getSymbol();
  const identifierSymbolName = identifierSymbol.getName();
  const declarationNode = defintionNode;
  const declarationNodeText = declarationNode.getText();
  const declarationNodePosStart = declarationNode.getStart();
  const declarationNodePosEnd = declarationNode.getEnd();
  const declarationSourceFilePath = declarationNode
    .getSourceFile()
    .getFilePath();
  const declarationNodeLineText = declarationNode
    .getSourceFile()
    .getText()
    .split("\n")[declarationNode.getEndLineNumber() - 1];
  const symbolTypeAtLocation =
    identifierSymbol.getTypeAtLocation(identifierNode);
  const symbolTypeAtLocationText = symbolTypeAtLocation.getText();
  const symbolType = identifierSymbol.getDeclaredType();
  const symbolFlags = identifierSymbol.getFlags();
  const symbolFlagsText = SymbolFlags[identifierSymbol.getFlags()];
  const symbbolTypeText = symbolType.getText();

  const bundle = {
    declarationNodeLineText,
    declarationNodePosEnd,
    declarationNodePosStart,
    declarationNodeText,
    declarationSourceFilePath,
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
