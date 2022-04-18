// this method is called when your extension is deactivated
export function deactivate() { }

import * as vscode from "vscode";
import { ExtensionCore } from "./extension_core/extensionCore";
import * as json_serializer from "./json_serializer/json_serializer";
import { VisualizationPanel } from "./visualizationPanel/VisualizationPanel";
import { FeatureNamingTfIdf } from "./feature_naming/tfidf/featureNamingTfIdf";
import { FCAConstraintsDiscovery } from "./constraints_discovery/fca/fcaConstraintsDiscovery";
import { FpGrowthConstraintsDiscovery } from "./constraints_discovery/fpGrowth/fpGrowthConstraintsDiscovery";
import { FoldersAdapter } from "./folder_adapter/FoldersAdapter";
import { BlockIdentification } from "./extension_core/BlockIdentification";
import { Utils } from "./Utils/Utilis";
import { Block } from "./extension_core/Block";
import { create } from "domain";

export function activate(context: vscode.ExtensionContext) {
  let disposableCodeAdapt = vscode.commands.registerCommand(
    "spl-extension.adaptCode",
    async () => {

      let s = vscode.workspace.workspaceFolders;
      let allVariants = Utils.loadVariants(s!);

      let m = new FoldersAdapter();
      let filesVariants = await m.adaptFolders(s!);

      let blocksIdentification = new BlockIdentification();
      let identifiedBlocks: Block[];
      let fmJson: string;
      try {
        identifiedBlocks = await blocksIdentification.identifyBlocks(filesVariants);
        let featureNaming = new FeatureNamingTfIdf();
        let resultsFeatureNaming = featureNaming.nameBlocks(identifiedBlocks!);
        console.log(resultsFeatureNaming);
        Utils.attributeBlocksToVariants(allVariants, identifiedBlocks);
        let reqConstraints = FCAConstraintsDiscovery.getRequireIConstraints(allVariants, identifiedBlocks);
        let mutexConstraints = FCAConstraintsDiscovery.getMutualExculsionIConstraints(allVariants, identifiedBlocks);
        let reqConstraintFpGrowth = await FpGrowthConstraintsDiscovery.getRequireConstraints(allVariants, identifiedBlocks);
        fmJson = Utils.exportFMForgeJson(identifiedBlocks, reqConstraints, mutexConstraints, allVariants.length);
  
        await Utils.exportFullForgeProjectByMergeVariants(identifiedBlocks, allVariants, s!);
        
        VisualizationPanel.createOrShow(context.extensionUri, allVariants, identifiedBlocks, reqConstraints, mutexConstraints, reqConstraintFpGrowth);
        // let blocksByVariantJson = Utils.getBlocksByVariantJson(allVariants) ;  

      }
      catch (err) {
        console.log("error from main   " + err);
      }

      // await Utils.saveFmForgeJson(fmJson!,s!) ;



    }
  );

  context.subscriptions.push(disposableCodeAdapt);
}