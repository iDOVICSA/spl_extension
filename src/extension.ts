// this method is called when your extension is deactivated
export function deactivate() {}

import * as vscode from "vscode";
import { ExtensionCore } from "./extension_core/extensionCore";

export function activate(context: vscode.ExtensionContext) {
  let disposableCodeAdapt = vscode.commands.registerCommand(
    "spl-extension.adaptCode",
    () => {
      let extensionCore = new ExtensionCore();
      extensionCore.getRMap(vscode.workspace.textDocuments);

      extensionCore.identifyBlocks();

      let document: vscode.TextDocument | undefined =
        vscode.window.activeTextEditor?.document;
      if (document) {
        let fullText: string = document.getText();
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(fullText.length - 1)
        );
      } else {
        vscode.window.showWarningMessage(
          "cant execute command : no opened files"
        );
      }
    }
  );

  context.subscriptions.push(disposableCodeAdapt);
}
