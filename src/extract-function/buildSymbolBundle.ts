import { SymbolFlags } from "ts-morph";

import type { Identifier } from "ts-morph";

export const buildSymbolBundle = (identiferNode: Identifier) => {
  const identiferNodeSourceFilePath = identiferNode
    .getSourceFile()
    .getFilePath();
  const identifierNodeText = identiferNode.getText();
  const identifierNodeStart = identiferNode.getStart();
  const identifierNodeEnd = identiferNode.getEnd();
  const identifierNodeKind = identiferNode.getKindName();
  const identiferNodeLineText = identiferNode
    .getSourceFile()
    .getText()
    .split("\n")[identiferNode.getEndLineNumber() - 1];
  const identifierSymbol = identiferNode.getSymbol();
  const identifierSymbolName = identifierSymbol.getName();
  const declarationNode = identifierSymbol.getDeclarations()[0];
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
    identifierSymbol.getTypeAtLocation(identiferNode);
  const symbolTypeAtLocationText = symbolTypeAtLocation.getText();
  const symbolType = identifierSymbol.getDeclaredType();
  const symbolFlags = identifierSymbol.getFlags();
  const symbolFlagsText = SymbolFlags[identifierSymbol.getFlags()];
  const symbbolTypeText = symbolType.getText();
  return {
    declarationNodeLineText,
    declarationNodePosEnd,
    declarationNodePosStart,
    declarationNodeText,
    declarationSourceFilePath,
    identiferNodeLineText,
    identiferNodeSourceFilePath,
    identifierNodeEnd,
    identifierNodeKind,
    identifierNodeStart,
    identifierNodeText,
    identifierSymbolName,
    symbbolTypeText,
    symbolFlags,
    symbolFlagsText,
    symbolTypeAtLocationText,
  };
};
