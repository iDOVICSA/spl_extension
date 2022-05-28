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






  let disposableCodeAdapt = vscode.commands.registerCommand(
    "spl-extension.adaptCode",
    async (_e: vscode.Uri, uris?: [vscode.Uri, vscode.Uri]) => {
      const configurationOptions = Utils.getOptions();

      let s = vscode.workspace.workspaceFolders;
      let allVariants = Utils.loadVariants(s!, uris, configurationOptions.excludeFilter);

      let m = new FoldersAdapter();
      let filesVariants = await m.adaptFolders(s!, uris, configurationOptions.excludeFilter);

      let blocksIdentification = new BlockIdentification();
      let identifiedBlocks!: Block[];
      let fmJson: string;
      try {



        let divideFunc : any = vscode.workspace.getConfiguration().get("conf.settingsEditor.divideMethods")  ; 
        divideFunc = divideFunc.prop1 as boolean ; 
        identifiedBlocks! = await blocksIdentification.identifyBlocksInit(filesVariants,divideFunc);

          
          
        configurationOptions.divideFunc = configurationOptions.divideFunc.prop1 as boolean;
        identifiedBlocks! = await blocksIdentification.identifyBlocks(filesVariants, configurationOptions.divideFunc);
        let featureNaming = new FeatureNamingTfIdf();
        let resultsFeatureNaming = featureNaming.nameBlocks(identifiedBlocks!);
        Utils.attributeBlocksToVariants(allVariants, identifiedBlocks!);
        Utils.attributePercentageToBlocks(identifiedBlocks!);
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


            let seedsMaps = await ForgeExport.exportForge(identifiedBlocks!, allVariants, s!);
            let mapsJson = seedsMaps[0];
            let seedsJson = seedsMaps[1];
            if (configurationOptions.configuredViewFmAlgorithm.prop2) {
              fmJson = flatFeatureDiagram.createFeatureModel(configurationOptions.configuredViewFmName);
              await Utils.saveFmForgeJson("~FlatFMSynthesis.functionalities.maps.forge", "FlatFMSynthesis.maps.forge", "FlatFMSynthesis.fm.forge", fmJson!, mapsJson, seedsJson, s!);
            }

            if (configurationOptions.configuredViewFmAlgorithm.prop1) {
              fmJson = alternativesBeforeHierarchyFMSynthesis.createFeatureModel(configurationOptions.configuredViewFmName);
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

  let disposabeInitVariants = vscode.commands.registerCommand("spl-extension.InitLsp",()=>{
    let s = vscode.workspace.workspaceFolders;
    
  });

  context.subscriptions.push(disposabeInitVariants) ;
  context.subscriptions.push(disposableCodeAdapt);
}
