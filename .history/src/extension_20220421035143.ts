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
import { AlternativesBeforeHierarchyFMSynthesis } from "./feature_model_synthesis/alternatives_before_hierarchy/AlternativesBeforeHierarchyFMSynthesis";
import { Constrainte } from "./constraints_discovery/constrainte";
import { FlatFeatureDiagram } from "./feature_model_synthesis/flat_feature_diagram/FlatFeatureDiagram";

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
        const configuredView: any = vscode.workspace.getConfiguration().get('conf.settingsEditor.fmAlgorithmSetting');
        console.log(configuredView.prop1);

        identifiedBlocks = await blocksIdentification.identifyBlocks(filesVariants);
        let featureNaming = new FeatureNamingTfIdf();
        let resultsFeatureNaming = featureNaming.nameBlocks(identifiedBlocks!);
        Utils.attributeBlocksToVariants(allVariants, identifiedBlocks);
        let reqConstraints = FCAConstraintsDiscovery.getRequireIConstraints(allVariants, identifiedBlocks);
        let mutexConstraints = FCAConstraintsDiscovery.getMutualExculsionIConstraints(allVariants, identifiedBlocks);
        let reqConstraintFpGrowth = await FpGrowthConstraintsDiscovery.getRequireConstraints(allVariants, identifiedBlocks);
        let alternativesBeforeHierarchyFMSynthesis = new AlternativesBeforeHierarchyFMSynthesis(identifiedBlocks, reqConstraints, mutexConstraints, allVariants.length);
        let flatFeatureDiagram = new FlatFeatureDiagram(identifiedBlocks, reqConstraints, mutexConstraints, allVariants.length);
        //fmJson = Utils.exportFMForgeJson(identifiedBlocks, reqConstraints, mutexConstraints, allVariants.length);
        //   await Utils.exportFullForgeProject(identifiedBlocks, allVariants.length, s!);
        // let blocksByVariantJson = Utils.getBlocksByVariantJson(allVariants) ;  
        VisualizationPanel.createOrShow(context.extensionUri, allVariants, identifiedBlocks, reqConstraints, mutexConstraints, reqConstraintFpGrowth);
        fmJson = flatFeatureDiagram.createFeatureModel();
        //  await Utils.saveFmForgeJson(fmJson!, s!);


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
      catch (err) {
        console.log("error from main   " + err);
      }

      // await Utils.saveFmForgeJson(fmJson!,s!) ;



      /* VisualizationPanel.createOrShow(context.extensionUri, blocksByVariant, resultsFeatureNaming, result, result2, resullt3);
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
       }*/


      /* let extensionCore = new ExtensionCore();
       await extensionCore.identifyUsingSemantics(vscode.workspace.textDocuments);
 
       //await  extensionCore.getRMap(vscode.workspace.textDocuments);
 
      /* let identifiedBlocks = extensionCore.identifyBlocks();
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
       }*/
    }
  );

  context.subscriptions.push(disposableCodeAdapt);
}