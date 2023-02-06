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
  const identifierSymbol = identifierNode.getSymbol();
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
    identifierSymbol.getTypeAtLocation(identifierNode);
  const symbolTypeAtLocationText = symbolTypeAtLocation.getText();
  const symbolType = identifierSymbol.getDeclaredType();
  const symbolFlags = identifierSymbol.getFlags();
  const symbolFlagsText = SymbolFlags[identifierSymbol.getFlags()];
  const symbbolTypeText = symbolType.getText();
  if (identifierNodeText === "pp") {
    const parentNode = identifierNode.getParent();
    const parentNodeText = parentNode.getText();
    const parentNodeStart = parentNode.getStart();
    const parentNodeEnd = parentNode.getEnd();
    const parentNodeKind = parentNode.getKindName();
    const parentNodeLineText = parentNode.getSourceFile().getText().split("\n")[
      parentNode.getEndLineNumber() - 1
    ];
    const parentSymbol = parentNode.getSymbol();
    const identifierSymbolName = parentSymbol.getName();
    const declarationNode = parentSymbol.getDeclarations()[0];
    console.log({
      declarationNode,
      identifierSymbolName,
      parentNodeEnd,
      parentNodeKind,
      parentNodeLineText,
      parentNodeStart,
      parentNodeText,
    });
  }
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
