import * as vscode from "vscode";
import { Constrainte } from "../constraints_discovery/constrainte";
import { Block } from "../extension_core/Block";
import { Variant } from "../extension_core/Variant";
import * as json_serializer from "./../json_serializer/json_serializer";
export class Utils {

    /**
     * 
     * @param initialFolders : Opened Folders in the workspace 
     * @returns List of Variant objects 
     */
    static loadVariants(initialFolders: readonly vscode.WorkspaceFolder[]): Variant[] {
        let resullt: Variant[] = [];

        for (const folder of initialFolders) {
            let variantId = folder.uri.fsPath.split(folder.name)[0] + folder.name + "/";
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

    static exportFMForgeJson(blocks: Block[], requireConstraints: Constrainte[], mutexConstraints: Constrainte[]) {
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
        blocks.forEach((block) => {
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
        });
        for (const reqCon of requireConstraints) {
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

}