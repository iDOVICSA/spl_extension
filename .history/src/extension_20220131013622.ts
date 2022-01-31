// this method is called when your extension is deactivated
export function deactivate() { }

import { stringify } from "querystring";
import * as vscode from "vscode";
import { ExtensionCore } from "./extension_core/extensionCore";
import * as json_serializer from "./json_serializer/json_serializer";
import { VisualizationPanel } from "./visualizationPanel/VisualizationPanel";
import { FeatureNamingTfIdf } from "./feature_naming/tfidf/featureNamingTfIdf";
import { FCAConstraintsDiscovery } from "./constraints_discovery/fca/fcaConstraintsDiscovery";
import { FpGrowthConstraintsDiscovery } from "./constraints_discovery/fpGrowth/fpGrowthConstraintsDiscovery";

export function activate(context: vscode.ExtensionContext) {
  let disposableCodeAdapt = vscode.commands.registerCommand(
    "spl-extension.adaptCode",
    async () => {

      let extensionCore = new ExtensionCore();
      extensionCore.getRMap(vscode.workspace.textDocuments);

      let identifiedBlocks = extensionCore.identifyBlocks();
      const originalValue = identifiedBlocks;
      const str = JSON.stringify(originalValue, json_serializer.replacer);
      const newValue = JSON.parse(str, json_serializer.reviver);
      console.log(originalValue, newValue);
      let featureNaming = new FeatureNamingTfIdf();
      let resultsFeatureNaming = featureNaming.nameBlocks(identifiedBlocks!);


      let blocksByVariant = extensionCore.getBlocksByVariant(identifiedBlocks!);

      let fcaConstraintsDiscovery = new FCAConstraintsDiscovery();
      let result = fcaConstraintsDiscovery.getRequireConstraints(blocksByVariant);
      console.log("***************************");
      let result2 = fcaConstraintsDiscovery.getMutualExculsionConstraints(blocksByVariant);
      let fpGrowthConstraintsDiscovery = new FpGrowthConstraintsDiscovery();
      let resullt3 = await fpGrowthConstraintsDiscovery.getRequireConstraints(blocksByVariant);

      VisualizationPanel.createOrShow(context.extensionUri, blocksByVariant, resultsFeatureNaming, result, result2, resullt3);
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
