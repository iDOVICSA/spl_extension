// this method is called when your extension is deactivated
export function deactivate() { }

import * as vscode from "vscode";
import { ExtensionCore } from "./extension_core/extensionCore";
import * as json_serializer from "./json_serializer/json_serializer";
import { VisualizationPanel } from "../src/visualizationPanel/VisualizationPanel";

export function activate(context: vscode.ExtensionContext) {
  let disposableCodeAdapt = vscode.commands.registerCommand(
    "spl-extension.adaptCode",
    () => {

      let extensionCore = new ExtensionCore();
      extensionCore.getRMap(vscode.workspace.textDocuments);

      let identifiedBlocks = extensionCore.identifyBlocks();
      const originalValue = identifiedBlocks;
      const str = JSON.stringify(originalValue, json_serializer.replacer);
      const newValue = JSON.parse(str, json_serializer.reviver);
      console.log(originalValue, newValue);

      let blocksByVariant = extensionCore.getVariantsBlocks(identifiedBlocks!);

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
