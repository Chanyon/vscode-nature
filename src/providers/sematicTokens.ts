import * as path from "path";
import * as vscode from "vscode";
import * as Parser from "web-tree-sitter";

export default class SematicTokensProvider implements vscode.DocumentSemanticTokensProvider {
  parser: Parser | undefined;
  constructor(public legend: vscode.SemanticTokensLegend) {
    Parser.init().then(() => {
      Parser.Language.load(
        path.resolve(__dirname, "../../tree-sitter-nature.wasm")
      ).then(lang => {
        this.parser = new Parser();
        this.parser.setLanguage(lang);
      });
    });
  }
  
  onDidChangeSemanticTokens?: vscode.Event<void> | undefined;
  
  provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
    const tree = this.parser?.parse(document.getText());
    const query = this.parser?.getLanguage()
      .query("('message') @keyword");
    
    const captures = query?.captures(tree!.rootNode);
    console.log(captures);
    
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