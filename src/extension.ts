import * as vscode from 'vscode';
import SematicTokensProvider from './providers/sematicTokens';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // register semantic tokens provider
  const tokenTypes = [
    "type",
    "enum",
    "class",
    "function",
    "comment",
    "string",
    "number",
    "keyword",
    "parameter",
  ];
  const modifiers = ["definition", "deprecated", "documentation"];

  const selector: vscode.DocumentSelector = {
    language: "proto",
    scheme: "file"
  };

  const legend = new vscode.SemanticTokensLegend(tokenTypes, modifiers);
  const provider = new SematicTokensProvider(legend);

  console.log("--------------------", provider);
  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      selector,
      provider,
      legend
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
