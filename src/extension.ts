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
    async () => {
     /* let javaFileSymbols: (vscode.DocumentSymbol | vscode.SymbolInformation)[] | undefined = undefined;
      let csharpFileSymbols: (vscode.DocumentSymbol | vscode.SymbolInformation)[] | undefined = undefined;

      let javaUriExample = vscode.Uri.file("C:\\Users\\said\\Desktop\\PFE654\\Tests\\Notepad\\srcCut\\Notepad.java");
      let csharpUriExample =  vscode.Uri.file("C:\\HiveBackendVariants\\backendCardLikeFr\\Api\\v1\\AuthController.cs");
      
      //java example
      while (!javaFileSymbols) {
          await vscode.commands.executeCommand<
          (vscode.DocumentSymbol|vscode.SymbolInformation)[]
          >("vscode.executeDocumentSymbolProvider", javaUriExample).then(async (mySymbols) => {
            javaFileSymbols = mySymbols;
              console.log("sucess  :"  + "  " + mySymbols);
          }, (reason) => {
              console.log("error  " + reason);
          });
      }*/

     // C# example
      /*while (!csharpFileSymbols) {
          await vscode.commands.executeCommand<
              (vscode.DocumentSymbol|vscode.SymbolInformation)[]
          >("vscode.executeDocumentSymbolProvider", csharpUriExample).then(async (mySymbols) => {
            csharpFileSymbols = mySymbols;
              console.log("sucess  :"  + "  " + mySymbols);
          }, (reason) => {
              console.log("error  " + reason);
          });
      }
     */
      

      let s = vscode.workspace.workspaceFolders;
      
      let allVariants = Utils.loadVariants(s!);

      let m = new FoldersAdapter();
      let filesVariants = await m.adaptFolders(s!);

      let blocksIdentification = new BlockIdentification();
      let identifiedBlocks!: Block[];
      let fmJson: string;
      try {



        let divideFunc : any = vscode.workspace.getConfiguration().get("conf.settingsEditor.divideMethods")  ; 
        divideFunc = divideFunc.prop1 as boolean ; 
      //  identifiedBlocks! = await blocksIdentification.identifyBlocksInit(filesVariants,divideFunc);
        identifiedBlocks! = await blocksIdentification.identifyBlocks(filesVariants,divideFunc);

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
        VisualizationPanel.createOrShow(context.extensionUri, allVariants, identifiedBlocks!, reqConstraints, mutexConstraints, reqConstraintFpGrowth);
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

  let disposabeInitVariants = vscode.commands.registerCommand("spl-extension.InitLsp",()=>{
    let s = vscode.workspace.workspaceFolders;
    
  });

  context.subscriptions.push(disposabeInitVariants) ;
  context.subscriptions.push(disposableCodeAdapt);
}