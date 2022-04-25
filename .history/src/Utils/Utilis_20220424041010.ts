
import * as vscode from "vscode";
import { Constrainte } from "../constraints_discovery/constrainte";
import { Block } from "../extension_core/Block";
import { Variant } from "../extension_core/Variant";
import * as fs from 'fs';
import { off } from "process";
import { Element } from "../extension_core/Element";
import path = require("path");

export class Utils {

    /**
     * 
     * @param initialFolders : Opened Folders in the workspace 
     * @returns List of Variant objects 
     */
    static loadVariants(initialFolders: readonly vscode.WorkspaceFolder[]): Variant[] {
        let resullt: Variant[] = [];

        for (const folder of initialFolders) {
            let variantId = folder.uri.fsPath.split(folder.name)[0] + folder.name + path.sep;
            let variantName = folder.name;
            let variant = new Variant(variantId, variantName);
            resullt.push(variant);
        }

        return resullt;
    }


    static stringIsNotEmpty(s: string): boolean {
        return s.replace(/\s/g, "").length !== 0;
    }

    static attributeBlocksToVariants(variants: Variant[], blocks: Block[]) {
        for (const block of blocks) {
            let variantsOfBlock = Array.from(block.blockContent.keys());
            for (const variantId of variantsOfBlock) {
                let variant = variants.filter(item => item.variantId === variantId)[0];
                variant.blocksList.push(block);
            }
        }
    }

    static exportFMForgeJson(blocks: Block[], requireConstraints: Constrainte[], mutexConstraints: Constrainte[], variantsCount: number) {
        let funcionnalities: any[] = [];
        let constraints: any[] = [];
        let core = {
            "key": "s2a3i4-d7-ya45c-in66e",
            "name": "Notepad",
            "type": "Core",
            "parent": "-1",
            "parentRelation": "Normal",
            "presence": "Mandatory",
            "lgFile": "",
            "role": "",
            "hexColor": "",
            "help": "",
            "nodeWeight": -1
        };
        let mandatoryBlockId = -1;
        blocks.forEach((block) => {
            let blockVariantsCount = Array.from(block.blockContent.keys()).length;
            if (blockVariantsCount === variantsCount) {
                mandatoryBlockId = block.blockId;
                let blockData = {
                    "key": (block.blockId).toString(),
                    "name": "block" + block.blockId,
                    "type": "Functionality feature",
                    "parent": "s2a3i4-d7-ya45c-in66e",
                    "parentRelation": "Normal",
                    "presence": "Mandatory",
                    "lgFile": "",
                    "role": "",
                    "hexColor": "#d384a6",
                    "help": "",
                };
                funcionnalities.push(blockData);
            }
            else {
                let blockData = {
                    "key": (block.blockId).toString(),
                    "name": "block" + block.blockId,
                    "type": "Functionality feature",
                    "parent": "s2a3i4-d7-ya45c-in66e",
                    "parentRelation": "Normal",
                    "presence": "Optional",
                    "lgFile": "",
                    "role": "",
                    "hexColor": "#d384a6",
                    "help": "",
                };
                funcionnalities.push(blockData);
            }
        });
        for (const reqCon of requireConstraints) {
            if (reqCon.secondBlock !== mandatoryBlockId) {
                let reqConData = {
                    "type": "⇒",
                    "left": {
                        "type": "feature",
                        "featureKey": reqCon.firstBlock.toString()
                    },
                    "right": {
                        "type": "feature",
                        "featureKey": reqCon.secondBlock.toString()
                    }
                };
                constraints.push(reqConData);

            }

        }
        for (const mutexCon of mutexConstraints) {
            let mutexConData = {
                "type": "⇒",
                "left": {
                    "type": "feature",
                    "featureKey": mutexCon.firstBlock.toString()
                },
                "right": {
                    "type": "¬",
                    "child": {
                        "type": "feature",
                        "featureKey": mutexCon.secondBlock.toString()
                    }
                }
            };
            constraints.push(mutexConData);

        }
        let keycore = "functionalities";
        const jsonObject: any = {};

        let fmJson = {
            "core": core,
            "functionalities": funcionnalities,
            "fileResources": [],
            "textResources": [],
            "smartAppAssetResources": [],
            "colorResources": [],
            "referencedModels": [],
            "constraints": constraints
        };
        return JSON.stringify(fmJson);
    }
    static async saveFmForgeJson(fileName: string, fmJson: string, workspaceFolders: readonly vscode.WorkspaceFolder[]) {
        try {

            let resulltPath = workspaceFolders[0].uri.fsPath.split(workspaceFolders![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
            console.log(vscode.Uri.file(resulltPath));
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(resulltPath));

            vscode.workspace.updateWorkspaceFolders(workspaceFolders ? workspaceFolders.length : 0, null, { uri: vscode.Uri.file(resulltPath) });
            fs.writeFile(resulltPath + path.sep + fileName, fmJson!, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }

                console.log("JSON file has been saved.");
            });
        }
        catch (err) {
            console.log("result folder " + err);
        }
    }
    /**
     * exports full forge project with feature model and feature maps
     * Mapping blocks <=> adding them to deletionPropagations 
     * mandatory block will not be added to deletionPropagations
     * @param blocks 
     * @param variantsCount 
     */
    static async exportFullForgeProject(blocks: Block[], variantsCount: number, workspaceFolders: readonly vscode.WorkspaceFolder[]) {
        console.log(blocks);
        let resulltPath = workspaceFolders[0].uri.fsPath.split(workspaceFolders![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
        let treatedFiles: string[] = [];
        for (const block of blocks) {
            let variantsOfBlock = Array.from(block.blockContent.keys());
            try {
                if (variantsOfBlock.length > 1) {
                    for (let index = 0; index < block.blockContent.get(variantsOfBlock[0])?.length!; index++) {
                        const element = block.blockContent.get(variantsOfBlock[0])![index];
                        console.log(element.element.fileName);
                        let filePath = resulltPath + path.sep + element.element.fileName.replace(variantsOfBlock[0].replace("c:", ""), "");
                        if (!treatedFiles.includes(filePath)) {
                            let fileinit: string = "";
                            for (let index = 0; index < 1000; index++) {
                                fileinit = fileinit + "\n";
                            }
                            fs.appendFile(filePath, fileinit, function (err) {
                                if (err) { throw err; };
                            });
                            treatedFiles.push(filePath);
                        }

                        await vscode.workspace.openTextDocument(vscode.Uri.parse(filePath)).then(async (a: vscode.TextDocument) => {

                            await vscode.window.showTextDocument(a, 1, true).then(async e => {
                                await e.edit(edit => {
                                    edit.insert(new vscode.Position(element.elementRange.start.line, element.elementRange.start.character), element.element.instruction + "\n");
                                });

                                //   if ((element.element.getElementKind() === 5) || (element.element.getElementKind() === 11)) {
                                let end = element.elementRange.end.line;
                                let elementLength = element.elementRange.end.line - element.elementRange.start.line + 1;
                                let range = new vscode.Range(end + 1, 0, end + elementLength + 1, 0);
                                await e.edit(edit => {
                                    edit.delete(range);
                                });

                                // }
                            });
                        }, (error: any) => {
                            console.error(error);
                            debugger;
                        });



                    }
                    await vscode.commands.executeCommand("saveAll");
                    await vscode.commands.executeCommand("workbench.action.closeAllEditors");

                }

            }
            catch (err) {
                console.log("exportFullForgeProject " + err);
            }
            //   await vscode.commands.executeCommand("saveAll");
            // await vscode.commands.executeCommand("workbench.action.closeAllEditors");

        }
    }

    static getBlocksByVariantJson(allVariants: Variant[]) {
        let indexVariant = 0;
        let variants: any[] = [];
        for (const variant of allVariants) {
            let blocks: any[] = [];
            for (const block of variant.blocksList) {
                let blockData = {
                    "blockId": block.blockId,
                    "blockName": block.blockName,
                    "blockRatio": 20
                };
                blocks.push(blockData);
            }
            variants.push(blocks);
        }
        let resultJson = {
            "variants": variants
        };


        return JSON.stringify(resultJson);

    }
}