import * as path from "path";
import * as vscode from "vscode";
import * as Parser from "web-tree-sitter";

export default class SematicTokensProvider implements vscode.DocumentSemanticTokensProvider {
  parser: Parser | undefined;
  constructor(public legend: vscode.SemanticTokensLegend) {
    // console.log("path---------",path.resolve(__dirname, "../../tree-sitter-nature.wasm"))
    Parser.init().then(() => {
      Parser.Language.load(
        path.resolve(__dirname, "../tree-sitter-nature.wasm")
      ).then(lang => {
        this.parser = new Parser();
        this.parser.setLanguage(lang);
      });
    });
  }
  
  onDidChangeSemanticTokens?: vscode.Event<void> | undefined;
  
  provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
    const tree = this.parser?.parse(document.getText());
    // (["fn" "for"] @keyword)
    const query = this.parser?.getLanguage()
    .query(`
    [
      (callExpr 
        (identifier) @function)

      (funDecl
        (identifier) @function)

      (typeDecl 
        (identifier) @type)
      
      (typeDecl 
        (identifier) @type
          (unionType [
            (baseType)
            (baseType 
              (identifier) @type)
            ]))
      
      (parameterList
          (parameterDecl
            type: (type
              (baseType) @type)
            name: (identifier) @string))
      ]
        `);
      // console.log("query----------------",query);
      
      const captures = query?.captures(tree!.rootNode);
      // console.log("captures----------------",captures);
      
      const tokenBuilder = new vscode.SemanticTokensBuilder(this.legend);
      
      if (captures) {
        for (const capture of captures) {
          const range = new vscode.Range(
            new vscode.Position(
              capture.node.startPosition.row,
              capture.node.startPosition.column,
            ),
            new vscode.Position(
              capture.node.endPosition.row,
              capture.node.endPosition.column,
            ),
          );

          // console.log(`capture val---------${capture.name}`);
          tokenBuilder.push(
            range,
            capture.name
          );
        }
    }
    const tokens = tokenBuilder.build();
    return Promise.resolve(tokens);
  }
  
}