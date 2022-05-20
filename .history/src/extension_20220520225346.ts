// this method is called when your extension is deactivated
export function deactivate() { }
import path = require("path");

import * as vscode from "vscode";
import { VisualizationPanel } from "./visualizationPanel/VisualizationPanel";
import { FeatureNamingTfIdf } from "./feature_naming/tfidf/featureNamingTfIdf";
import { FCAConstraintsDiscovery } from "./constraints_discovery/fca/fcaConstraintsDiscovery";
import { FpGrowthConstraintsDiscovery } from "./constraints_discovery/fpGrowth/fpGrowthConstraintsDiscovery";
import { FoldersAdapter } from "./folder_adapter/FoldersAdapter";
import { BlockIdentification } from "./extension_core/BlockIdentification";
import { Utils } from "./Utils/Utilis";
import { Block } from "./extension_core/Block";
import { AlternativesBeforeHierarchyFMSynthesis } from "./feature_model_synthesis/alternatives_before_hierarchy/AlternativesBeforeHierarchyFMSynthesis";
import { ForgeExport } from "./ForgeExport/ForgeExport";
import { Constrainte } from "./constraints_discovery/constrainte";
import { FlatFeatureDiagram } from "./feature_model_synthesis/flat_feature_diagram/FlatFeatureDiagram";

export function activate(context: vscode.ExtensionContext) {
  function isodd(element: any) {
    console.log(element);
    return (element % 2 == 1);
  }
  let disposableCodeAdapt = vscode.commands.registerCommand(
    "spl-extension.adaptCode",
    async (_e: vscode.Uri, uris?: [vscode.Uri, vscode.Uri]) => {

      let s = vscode.workspace.workspaceFolders;
      console.log(uris?.includes(s![0].uri));
      s = s?.filter(e => uris.(e.uri));
      let allVariants = Utils.loadVariants(s!);

      let m = new FoldersAdapter();
      let filesVariants = await m.adaptFolders(s!);

      let blocksIdentification = new BlockIdentification();
      let identifiedBlocks!: Block[];
      let fmJson: string;
      try {


        /*vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: "Blocks identification ",
          cancellable: false
        }, async (progress, token) => { 
    
          progress.report({ increment: 0 });
    
//          identifiedBlocks! = await blocksIdentification.identifyBlocks(filesVariants);

          progress.report({ increment: 40, message: "I am long running! - still going..." });

     //     let featureNaming = new FeatureNamingTfIdf();
       //   let resultsFeatureNaming = featureNaming.nameBlocks(identifiedBlocks!!);

          
            progress.report({ increment: 45, message: "I am long running! - still going even more..." });
        
          setTimeout(() => {
            progress.report({ increment: 50, message: "I am long running! - almost there..." });
          }, 3000);
    
          const p = new Promise<void>(resolve => {
            setTimeout(() => {
              resolve();
            }, 5000);
          });
    
          return p;
        });*/
        let divideFunc: any = vscode.workspace.getConfiguration().get("conf.settingsEditor.divideMethods");
        divideFunc = divideFunc.prop1 as boolean;
        identifiedBlocks! = await blocksIdentification.identifyBlocks(filesVariants, divideFunc);
        let featureNaming = new FeatureNamingTfIdf();
        let resultsFeatureNaming = featureNaming.nameBlocks(identifiedBlocks!);
        Utils.attributeBlocksToVariants(allVariants, identifiedBlocks!);
        let reqConstraints = FCAConstraintsDiscovery.getRequireIConstraints(allVariants, identifiedBlocks!);
        let mutexConstraints = FCAConstraintsDiscovery.getMutualExculsionIConstraints(allVariants, identifiedBlocks!);
        let reqConstraintFpGrowth = await FpGrowthConstraintsDiscovery.getRequireConstraints(allVariants, identifiedBlocks!);
        // fmJson = Utils.exportFMForgeJson(identifiedBlocks!, reqConstraints, mutexConstraints, allVariants.length);


        // VisualizationPanel.createOrShow(context.extensionUri, allVariants, identifiedBlocks!, reqConstraints, mutexConstraints, reqConstraintFpGrowth);
        // let blocksByVariantJson = Utils.getBlocksByVariantJson(allVariants) ;  
        let alternativesBeforeHierarchyFMSynthesis = new AlternativesBeforeHierarchyFMSynthesis(identifiedBlocks!, reqConstraints, mutexConstraints, allVariants.length);
        let flatFeatureDiagram = new FlatFeatureDiagram(identifiedBlocks!, reqConstraints, mutexConstraints, allVariants.length);
        //fmJson = Utils.exportFMForgeJson(identifiedBlocks!, reqConstraints, mutexConstraints, allVariants.length);
        //   await Utils.exportFullForgeProject(identifiedBlocks!, allVariants.length, s!);
        // let blocksByVariantJson = Utils.getBlocksByVariantJson(allVariants) ;  
        VisualizationPanel.createOrShow(context.extensionUri, allVariants, identifiedBlocks!, reqConstraints, mutexConstraints, reqConstraints);

        //fmJson= alternativesBeforeHierarchyFMSynthesis.createFeatureModel();

        //  await Utils.exportFullForgeProjectByMergeVariants(identifiedBlocks!, allVariants, s!);

        context.subscriptions.push(
          vscode.commands.registerCommand('spl-extension.createFM', async () => {

            const configuredViewGlobal = vscode.workspace.getConfiguration();
            const configuredViewFmAlgorithm: any = configuredViewGlobal.get('conf.settingsEditor.fmAlgorithmSetting');
            const configuredViewFmName: any = configuredViewGlobal.get('conf.settingsEditor.featureModelNameSetting');
            let seedsMaps = await ForgeExport.exportForge(identifiedBlocks!, allVariants, s!);
            let mapsJson = seedsMaps[0];
            let seedsJson = seedsMaps[1];
            if (configuredViewFmAlgorithm.prop2) {
              fmJson = flatFeatureDiagram.createFeatureModel(configuredViewFmName);
              await Utils.saveFmForgeJson("~FlatFMSynthesis.functionalities.maps.forge", "FlatFMSynthesis.maps.forge", "FlatFMSynthesis.fm.forge", fmJson!, mapsJson, seedsJson, s!);
            }

            if (configuredViewFmAlgorithm.prop1) {
              fmJson = alternativesBeforeHierarchyFMSynthesis.createFeatureModel(configuredViewFmName);
              await Utils.saveFmForgeJson("~AlternativesBeforeHierarchyFMSynthesis.functionalities.maps.forge", "AlternativesBeforeHierarchyFMSynthesis.maps.forge", "AlternativesBeforeHierarchyFMSynthesis.fm.forge", fmJson!, mapsJson, seedsJson, s!);
            }

            let resulltPath = s![0].uri.fsPath.split(s!![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(resulltPath), { forceNewWindow: true });
          })
        );
      }
      catch (err) {
        console.log("error from main   " + err);
      }

      // await Utils.saveFmForgeJson(fmJson!,s!) ;



    }
  );
  context.subscriptions.push(disposableCodeAdapt);
}
