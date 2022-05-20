
import * as vscode from "vscode";
import { Constrainte } from "../constraints_discovery/constrainte";
import { Block } from "../extension_core/Block";
import { Variant } from "../extension_core/Variant";
import * as fs from 'fs';
import { off } from "process";
import { Element } from "../extension_core/Element";
import path = require("path");
import { checkServerIdentity } from "tls";
import { ElementRange } from "../extension_core/ElementRange";

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
            let variantsOfBlock = Array.from(block.sourceCodeContent.keys());
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
            let blockVariantsCount = Array.from(block.sourceCodeContent.keys()).length;
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
    static async saveFmForgeJson(seedsFileName: string, mapsFileName: string, fmFileName: string, fmJson: string, mapsJson: string, seedsJson: string, workspaceFolders: readonly vscode.WorkspaceFolder[]) {
        try {

            let resulltPath = workspaceFolders[0].uri.fsPath.split(workspaceFolders![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(resulltPath));
            console.log("hh");
            //vscode.workspace.updateWorkspaceFolders(workspaceFolders ? workspaceFolders.length : 0, null, { uri: vscode.Uri.file(resulltPath) });
            fs.writeFile(resulltPath + path.sep + fmFileName, fmJson!, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }

                console.log("FM JSON file has been saved.");
            });
            fs.writeFile(resulltPath + path.sep + mapsFileName, mapsJson!, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }

                console.log("Maps JSON file has been saved.");
            });
            fs.writeFile(resulltPath + path.sep + seedsFileName, seedsJson!, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }

                console.log("Seeds JSON file has been saved.");
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
        let deletionPropagations: any[] = [];
        let replacementPropagations: any[] = [];
        let resourcePropagations: any[] = [];
        let pathPropagations: any[] = [];



        let resulltPath = workspaceFolders[0].uri.fsPath.split(workspaceFolders![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
        let treatedFiles: string[] = [];
        for (const block of blocks) {
            let variantsOfBlock = Array.from(block.sourceCodeContent.keys());
            try {
                if (variantsOfBlock.length > 1) {
                    for (let index = 0; index < block.sourceCodeContent.get(variantsOfBlock[0])?.length!; index++) {
                        const element = block.sourceCodeContent.get(variantsOfBlock[0])![index];
                        console.log(element.element.fileName);
                        let filePath = resulltPath + path.sep + element.element.fileName.fsPath.replace(variantsOfBlock[0].replace("c:", ""), "");
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

        let mapsJson = {
            "deletionPropagations": deletionPropagations,
            "replacementPropagations": replacementPropagations,
            "resourcePropagations": resourcePropagations,
            "pathPropagations": pathPropagations

        };
        return JSON.stringify(mapsJson);
    }

























    /**
     * exports full forge project with feature model and feature maps
     * Mapping blocks <=> adding them to deletionPropagations 
     * mandatory block will not be added to deletionPropagations
     * @param blocks 
     * @param variantsCount 
     */
    static async exportFullForgeProjectByMergeVariants(blocks: Block[], variants: Variant[], workspaceFolders: readonly vscode.WorkspaceFolder[]) {
        let deletionPropagations: any[] = [];
        let replacementPropagations: any[] = [];
        let resourcePropagations: any[] = [];
        let pathPropagations: any[] = [];
        let resulltPath = workspaceFolders[0].uri.fsPath.split(workspaceFolders![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
        let treatedFiles: string[] = [];
        let treatedBlocks: Block[] = [];
        let treatedVariants: Variant[] = [];
        let pathRootsMap: Map<string, vscode.Range> = new Map<string, vscode.Range>();
        // Map<fileName, Merged Elements>
        let mergeResultArray = new Map<string, (ElementRange | undefined)[]>();
        let debugIndex = 0;
        pathRootsMap.set("root", new vscode.Range(0, 0, 0, 0));
        while (treatedBlocks.length < blocks.length) {
            let maximal = this.getVariantWithMaximalBlocks(variants);
            //blockList - treatedAlreadyBlocks 
            let untreatedBlocks = maximal.blocksList.filter(item => treatedBlocks.indexOf(item) < 0);
            //order blockList :
            this.sortBlocksBySize(untreatedBlocks);

            for (const block of untreatedBlocks) {

                while (block.sourceCodeContent.get(maximal.variantId)?.length! > 0) {
                    for (const content of block.sourceCodeContent.get(maximal.variantId)!) {
                        try {
                            debugIndex++;
                            if (debugIndex === 8) {
                                console.log('stop ');
                            }
                            let filePath = resulltPath + path.sep + content.element.fileName.fsPath.replace(maximal.variantId.replace("c:", ""), "");
                            if (!treatedFiles.includes(filePath)) {
                                let fileinit: string = "";
                                for (let index = 0; index < 1000; index++) {
                                    fileinit = fileinit + "\n";
                                }
                                fs.appendFile(filePath, fileinit, function (err) {
                                    if (err) { throw err; };
                                });
                                mergeResultArray.set(filePath, []);
                                treatedFiles.push(filePath);
                            }
                            //Filling the pathroot map to be checked for semantic merge 
                            //TODO : before pathRoot.set check if that range is available : 
                            if ((content.element.getElementKind() !== 5) && (content.element.getElementKind() !== 11)) {
                                if (content.element.getElementParentInstruction().replace(/\s+/g, '') === content.element.instruction.replace(/\s+/g, '')) {
                                    pathRootsMap.set(content.element.pathToRoot, content.elementRange);
                                }
                            }
                            else {
                                pathRootsMap.set(content.element.pathToRoot, content.elementRange);
                            }



                            if (pathRootsMap.get(content.element.pathToRoot)) {
                                let distanceParentToElement: number;
                                if (content.element.getElementParentInstruction() === "root") {
                                    distanceParentToElement = content.elementRange.start.line;

                                }
                                else {
                                    distanceParentToElement = content.elementRange.start.line - content.element.parent!.elementRange.start.line;
                                }
                                let whereIsCurrentParent: number;
                                let elementNewEndPosition: number;
                                let currentScopeLength: number;
                                let elementNewStartPosition: number;

                                if ((content.element.getElementKind() === 5) || (content.element.getElementKind() === 11) || ((content.element.getElementKind() === 8) && (content.element.getElementParentInstruction().replace(/\s+/g, '') === content.element.instruction.replace(/\s+/g, '')))) {
                                    whereIsCurrentParent = pathRootsMap.get(content.element.parent!.element.pathToRoot.replace(/\s+/g, ''))?.start.line!;
                                    currentScopeLength = pathRootsMap.get(content.element.parent!.element.pathToRoot.replace(/\s+/g, ''))?.end.line! - pathRootsMap.get(content.element.parent!.element.pathToRoot.replace(/\s+/g, ''))?.start.line! + 1;
                                    elementNewStartPosition = whereIsCurrentParent! + distanceParentToElement;
                                    if ((elementNewStartPosition > 0) && (elementNewStartPosition === whereIsCurrentParent + currentScopeLength - 1) && (content.elementRange.end.line !== whereIsCurrentParent + currentScopeLength - 1)) {
                                        elementNewStartPosition = elementNewStartPosition - 1;
                                    }

                                    if (content.element.getElementKind() === 8) {
                                        elementNewEndPosition = elementNewStartPosition;
                                    }
                                    else {
                                        elementNewEndPosition = elementNewStartPosition + content.elementRange.end.line - content.elementRange.start.line;
                                    }

                                }
                                else {
                                    whereIsCurrentParent = pathRootsMap.get(content.element.pathToRoot)?.start.line!;
                                    elementNewStartPosition = whereIsCurrentParent + distanceParentToElement;
                                    currentScopeLength = pathRootsMap.get(content.element.pathToRoot)?.end.line! - pathRootsMap.get(content.element.pathToRoot)?.start.line! + 1;
                                    if ((elementNewStartPosition > 0) && (elementNewStartPosition === whereIsCurrentParent + currentScopeLength - 1) && (content.elementRange.end.line !== whereIsCurrentParent + currentScopeLength - 1)) {
                                        elementNewStartPosition = elementNewStartPosition - 1;
                                    }
                                    elementNewEndPosition = elementNewStartPosition;
                                }
                                //Checking Availability for this new position : Scope Availability + Space Availability
                                //1-Scope


                                if (distanceParentToElement < currentScopeLength) {
                                    // scope is available
                                    //2 check begining availablity
                                    let len = mergeResultArray.get(filePath)![elementNewStartPosition];
                                    if (len === undefined) {
                                        //insert element
                                        let lengthBefore = mergeResultArray.get(filePath)?.length;
                                        for (let index = elementNewStartPosition; index <= elementNewEndPosition; index++) {
                                            this.insertAtPosition(content, index, mergeResultArray.get(filePath)!);
                                        }
                                        let lengthAfter = mergeResultArray.get(filePath)?.length;
                                        let nbrDecalage = lengthAfter! - lengthBefore!;

                                        let rootScopeEnd = pathRootsMap.get("root")?.end.line!;
                                        let currentEnd = content.elementRange.end.line;
                                        if ((currentEnd > rootScopeEnd) && (content.element.pathToRoot === "root")) {
                                            let newr = new vscode.Range(pathRootsMap.get("root")?.start.line!, pathRootsMap.get("root")?.start.character!, currentEnd, content.elementRange.end.character);
                                            pathRootsMap.set("root", newr);
                                        }
                                        //update ranges of pathRootsMap
                                        //1 update end of parents : end + content.length
                                        if ((nbrDecalage > 0) && (elementNewStartPosition <= lengthBefore!)) {
                                            this.updatePreviousParents(content, nbrDecalage, pathRootsMap);


                                            //2 update end of following 

                                            this.updateFollowingsEnd(elementNewEndPosition + 1, mergeResultArray.get(filePath)!, nbrDecalage, pathRootsMap);

                                        }

                                    }
                                    else {
                                        if (len?.elementRange.start.line === len?.elementRange.end.line) {
                                            //insert element
                                            let lengthBefore = mergeResultArray.get(filePath)?.length;

                                            //+1 of the element "len" which is holding current start position
                                            for (let index = elementNewStartPosition + 1; index <= elementNewEndPosition + 1; index++) {
                                                this.insertAtPosition(content, index, mergeResultArray.get(filePath)!);
                                            }
                                            let lengthAfter = mergeResultArray.get(filePath)?.length;
                                            let nbrDecalage = lengthAfter! - lengthBefore!;
                                            let rootScopeEnd = pathRootsMap.get("root")?.end.line!;
                                            let currentEnd = content.elementRange.end.line + 1;
                                            if ((currentEnd > rootScopeEnd) && (content.element.getElementParentInstruction() === "root")) {
                                                let newr = new vscode.Range(pathRootsMap.get("root")?.start.line!, pathRootsMap.get("root")?.start.character!, currentEnd, content.elementRange.end.character);
                                                pathRootsMap.set("root", newr);
                                            }
                                            //update ranges of pathRootsMap
                                            //1 update end of parents : end + content.length
                                            if ((nbrDecalage > 0) && (elementNewStartPosition <= lengthBefore!)) {
                                                this.updatePreviousParents(content, nbrDecalage, pathRootsMap);

                                                //2 update end of following 
                                                this.updateFollowingsEnd(elementNewEndPosition + 1, mergeResultArray.get(filePath)!, nbrDecalage, pathRootsMap);

                                            }
                                        }
                                        else {
                                            //not available because there is a block
                                            let end = len?.elementRange.end.line + 1;
                                            //insert element
                                            let lengthBefore = mergeResultArray.get(filePath)?.length;
                                            for (let index = elementNewStartPosition + end; index <= elementNewEndPosition + end; index++) {
                                                this.insertAtPosition(content, index, mergeResultArray.get(filePath)!);
                                            }
                                            let lengthAfter = mergeResultArray.get(filePath)?.length;
                                            let nbrDecalage = lengthAfter! - lengthBefore!;
                                            let rootScopeEnd = pathRootsMap.get("root")?.end.line!;
                                            let currentEnd = content.elementRange.end.line + end;
                                            if ((currentEnd > rootScopeEnd) && (content.element.getElementParentInstruction() === "root")) {
                                                let newr = new vscode.Range(pathRootsMap.get("root")?.start.line!, pathRootsMap.get("root")?.start.character!, currentEnd, content.elementRange.end.character);
                                                pathRootsMap.set("root", newr);
                                            }
                                            //update ranges of pathRootsMap
                                            //1 update end of parents : end + content.length
                                            if ((nbrDecalage > 0) && (elementNewStartPosition <= lengthBefore!)) {
                                                this.updatePreviousParents(content, nbrDecalage, pathRootsMap);

                                                //2 update end of following 
                                                this.updateFollowingsEnd(elementNewEndPosition + 1, mergeResultArray.get(filePath)!, nbrDecalage, pathRootsMap);

                                            }


                                        }
                                    }

                                }
                                else {
                                    //insert element
                                    if ((content.element.getElementKind() === 5) || (content.element.getElementKind() === 11)) {
                                        elementNewStartPosition = pathRootsMap.get(content.element.pathToRoot)?.end.line!;
                                        elementNewEndPosition = elementNewStartPosition + content.elementRange.end.line - content.elementRange.start.line;

                                    }
                                    else {
                                        elementNewStartPosition = pathRootsMap.get(content.element.pathToRoot)?.end.line!;
                                        elementNewEndPosition = elementNewStartPosition + content.elementRange.end.line - content.elementRange.start.line;
                                    }

                                    let lengthBefore = mergeResultArray.get(filePath)?.length;
                                    for (let index = elementNewStartPosition; index <= elementNewEndPosition; index++) {
                                        this.insertAtPosition(content, index, mergeResultArray.get(filePath)!);
                                    }
                                    let lengthAfter = mergeResultArray.get(filePath)?.length;
                                    let nbrDecalage = lengthAfter! - lengthBefore!;
                                    let rootScopeEnd = pathRootsMap.get("root")?.end.line!;
                                    let currentEnd = content.elementRange.end.line;
                                    if ((currentEnd > rootScopeEnd) && (content.element.getElementParentInstruction() === "root")) {
                                        let newr = new vscode.Range(pathRootsMap.get("root")?.start.line!, pathRootsMap.get("root")?.start.character!, currentEnd, content.elementRange.end.character);
                                        pathRootsMap.set("root", newr);
                                    }
                                    //update ranges of pathRootsMap
                                    //1 update end of parents : end + content.length
                                    if ((nbrDecalage > 0) && (elementNewStartPosition <= lengthBefore!)) {
                                        this.updatePreviousParents(content, nbrDecalage, pathRootsMap);
                                        //2 update end of following 

                                        this.updateFollowingsEnd(elementNewEndPosition + 1, mergeResultArray.get(filePath)!, nbrDecalage, pathRootsMap);
                                    }
                                }

                                let idxRemove = block.sourceCodeContent.get(maximal.variantId)?.indexOf(content);
                                block.sourceCodeContent.get(maximal.variantId)?.splice(idxRemove!, 1);
                                console.log("r");
                            }
                            else {
                                console.log("a");
                            }

                            //if pathRoot of element is not set ignore it 

                            /*  await vscode.workspace.openTextDocument(vscode.Uri.parse(filePath)).then(async (a: vscode.TextDocument) => {
              
                                  await vscode.window.showTextDocument(a, 1, true).then(async e => {
                                      await e.edit(edit => {
                                          edit.insert(new vscode.Position(element.elementRange.start.line, element.elementRange.start.character), element.element.instruction + "\n");
                                      });
                                      let end = element.elementRange.end.line;
                                      let elementLength = element.elementRange.end.line - element.elementRange.start.line + 1;
                                      let range = new vscode.Range(end + 1, 0, end + elementLength + 1, 0);
                                      await e.edit(edit => {
                                          edit.delete(range);
                                      });
                                  });
                              }, (error: any) => {
                                  console.error(error);
                                  debugger;
                              });*/
                        }
                        catch (err) {
                            debugger;
                        }
                    }
                }

                treatedBlocks.push(block);
            }
            treatedVariants.push(maximal);
            let index = variants.indexOf(maximal);
            variants.splice(index, 1);
        }
        let tst = Array.from(mergeResultArray.keys());
        let s = tst[0];

        for (let idx = 0; idx < mergeResultArray.get(s)?.length!; idx++) {
            const element = mergeResultArray.get(s)![idx];
            if (element) {

                await vscode.workspace.openTextDocument(vscode.Uri.parse(s)).then(async (a: vscode.TextDocument) => {

                    await vscode.window.showTextDocument(a, 1, true).then(async e => {
                        await e.edit(edit => {
                            edit.insert(new vscode.Position(idx, element.elementRange.start.character), element.element.instruction);
                        });
                        /*let end = element.elementRange.end.line;
                        let elementLength = element.elementRange.end.line - element.elementRange.start.line + 1;
                        let range = new vscode.Range(end + 1, 0, end + elementLength + 1, 0);
                        await e.edit(edit => {
                            edit.delete(range);
                        });*/
                        if ((element.element.getElementKind() === 5) || (element.element.getElementKind() === 11)) {
                            idx = idx + element.elementRange.end.line - element.elementRange.start.line + 1;
                        }
                    });
                }, (error: any) => {
                    console.error(error);
                    debugger;
                });
            }

        }
        await vscode.commands.executeCommand("saveAll");
        await vscode.commands.executeCommand("workbench.action.closeAllEditors");


        let mapsJson = {
            "deletionPropagations": deletionPropagations,
            "replacementPropagations": replacementPropagations,
            "resourcePropagations": resourcePropagations,
            "pathPropagations": pathPropagations

        };
        return JSON.stringify(mapsJson);
    }

















    static getVariantWithMaximalBlocks(variants: Variant[]): Variant {
        let currentMax = 0;
        let maximalVariant: Variant;
        try {
            for (const variant of variants) {
                if (variant.blocksList.length > currentMax) {
                    currentMax = variant.blocksList.length;
                    maximalVariant = variant;
                }
            }
        }
        catch (err) {
            debugger;
        }
        return maximalVariant!;
    }














    static insertAtPosition(value: ElementRange, position: number, tab: (ElementRange | undefined)[]) {
        for (let idx = tab.length; idx <= position; idx++) {
            tab.push(undefined);
        }
        if (tab[position] === undefined) {
            tab[position] = value;
        }
        else {
            tab.splice(position, 0, value).join();
        }
    }

    /**
     * 
     * @param idxStart : index of updating start
     * @param elementsArray : the array to be updated : end+1
     * @param nbrDecalage : 
     * @param pathRootsMap 
     */
    static updateFollowingsEnd(idxStart: number, elementsArray: (ElementRange | undefined)[], nbrDecalage: number, pathRootsMap: Map<string, vscode.Range>) {
        for (let index = idxStart; index < elementsArray.length!; index++) {
            let element = elementsArray[index];
            if (element !== undefined) {
                let oldRange = element!.elementRange;
                let newRange = new vscode.Range(index, oldRange.start.character, oldRange.end.line + nbrDecalage, oldRange.end.character);
                elementsArray[index] = new ElementRange(element.element, newRange);
                if (element.element.getElementParentInstruction() === "root") {
                    let nmt = new vscode.Range(pathRootsMap.get("root")?.start.line!, pathRootsMap.get("root")?.start.character!, newRange.end.line, newRange.end.character);
                    pathRootsMap.set("root", nmt);

                }
                else {
                    if ((element.element.getElementKind() === 5) || (element.element.getElementKind() === 11)) {
                        pathRootsMap.set(element.element.pathToRoot, newRange);

                    }
                    else {
                        if (element.element.getElementParentInstruction().replace(/\s+/g, '') === element.element.instruction.replace(/\s+/g, '')) {
                            pathRootsMap.set(element.element.pathToRoot, newRange);
                        }
                    }
                }
            }
        }
    }

    static updatePreviousParents(element: ElementRange, nbrDecalage: number, pathRootsMap: Map<String, vscode.Range>) {
        let parentsCount = element.element.pathToRoot.split("@@").length;
        let parent = element.element.pathToRoot;
        let parentArr = element.element.pathToRoot.split("@@");
        while (parentsCount > 1) {

            let currentRange = pathRootsMap.get(parent);
            let parentNewEndPosition = new vscode.Position(currentRange!.end.line + nbrDecalage, currentRange!.end.character);
            let newRange = new vscode.Range(currentRange!.start, parentNewEndPosition);
            pathRootsMap.set(parent, newRange);
            parentsCount--;
            parentArr.pop();
            parent = parentArr.join("@@");

        }

    }

    /* static indexToWrite(element : ElementRange , idxStart : number, elementsArray : (ElementRange|undefined)[]) : number{
         let condition = true; 
         let index = idxStart ; 
         let ArrLength = elementsArray.length ; 
         while (condition) {
             let elt = elementsArray[index] ;
             if (elt) {
                 if (elt.element.parent?.element.instruction){
 
                 }
                 else {
                     
                 }
 
             }
             else {
                 if (index>=ArrLength) {
                     return idxStart ;
                 }
                 else {
                     index++ ; 
                 }
             }
         }
 
     }*/



    static sortBlocksBySize(blocks: Block[]) {
        blocks.sort((a, b) => {
            if (a.sourceCodeContent.size > b.sourceCodeContent.size) {
                return -1;
            }
            if (a.sourceCodeContent.size < b.sourceCodeContent.size) {
                return 1;
            }
            return 0;
        });


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

    static showBlocDetails(b: Block): string {
        let firstVariant: any = undefined;
        let blocName = "/** \n" + "* Block Name : " + b.blockName + " \n";
        let variantTitle = "* Variants Name : \n";
        let txt = "* Block Element : \n";
        b.sourceCodeContent.forEach((elementRange: ElementRange[], key: string) => {
            if (!firstVariant) {
                firstVariant = key;
            }
            variantTitle = variantTitle + key + "\n";
        });
        variantTitle = variantTitle + "*/ \n";

        let elementRange = b.sourceCodeContent.get(firstVariant);
        let fileName = "";
        let fileNameSave = "";
        if (elementRange) {
            for (let index = 0; index < elementRange.length; index++) {
                const element = elementRange[index].element;
                fileName = element.fileName.fsPath.replace(firstVariant, "") + " : ";

                if (fileName !== fileNameSave) {
                    txt = txt + "/** \n";
                    txt = txt + "* " + fileName + "\n";
                    fileNameSave = fileName;
                }

                txt = txt + element.instruction + "\n";

            }
        }
        return blocName + variantTitle + txt;

    }
}