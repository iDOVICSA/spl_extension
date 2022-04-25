import { Block } from "../extension_core/Block";
import * as vscode from "vscode";
import { Utils } from "../Utils/Utilis";
import { Variant } from "../extension_core/Variant";
import { TreeElement } from "./TreeElement";
import { ElementRange } from "../extension_core/ElementRange";
import path = require("path");
import * as fs from 'fs';


export class ForgeExport {
    static async exportForge(blocks: Block[], variants: Variant[], workspaceFolders: readonly vscode.WorkspaceFolder[]) {
        let pathRootsMap: Map<string, boolean> = new Map<string, boolean>();
        let treatedBlocks: Block[] = [];
        let treatedFiles: string[] = [];
        let resulltPath = workspaceFolders[0].uri.fsPath.split(workspaceFolders![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
        let variantsCount = variants.length;
        let mergeResultTree = new Map<string, TreeElement[]>();

        let treatedVariants: Variant[] = [];

        while (treatedBlocks.length < blocks.length) {
            let maximal = Utils.getVariantWithMaximalBlocks(variants);
            //blockList - treatedAlreadyBlocks 
            let untreatedBlocks = maximal.blocksList.filter(item => treatedBlocks.indexOf(item) < 0);
            //order blockList :
            Utils.sortBlocksBySize(untreatedBlocks);
            pathRootsMap.set("root", true);
            for (const block of untreatedBlocks) {
                while (block.blockContent.get(maximal.variantId)?.length! > 0) {
                    for (const content of block.blockContent.get(maximal.variantId)!) {
                        let filePath = resulltPath + path.sep + content.element.fileName.fsPath.replace(maximal.variantId.replace("c:", ""), "");

                        if (!treatedFiles.includes(filePath)) {
                            let fileinit: string = "";
                            for (let index = 0; index < 1000; index++) {
                                fileinit = fileinit + "\n";
                            }
                            fs.appendFile(filePath, fileinit, function (err) {
                                if (err) { throw err; };
                            });
                            mergeResultTree.set(filePath, []);
                            treatedFiles.push(filePath);
                        }

                        if (pathRootsMap.get(content.getParentPathRoot())) {
                            if ((content.element.getElementKind() !== 5) && (content.element.getElementKind() !== 11)) {
                                if (content.element.getElementParentInstruction().replace(/\s+/g, '') === content.element.instruction.replace(/\s+/g, '')) {
                                    pathRootsMap.set(content.element.pathToRoot, true);
                                }
                            }
                            else {
                                pathRootsMap.set(content.element.pathToRoot, true);
                            }



                            if (content.getParent() === "root") {
                                let treeEm = new TreeElement(content, block);
                                mergeResultTree.get(filePath)?.push(treeEm);
                            }
                            else {
                                let treeEm = new TreeElement(content, block);
                                let elementPR = content.element.pathToRoot.split("@@");
                                let idx = 1;
                                let arr = mergeResultTree.get(filePath);
                                let length = elementPR.length;
                                if (content.elementRange.start.line !== content.elementRange.end.line) {
                                    length--;
                                }

                                while (idx < length) {
                                    let p = elementPR[idx];
                                    for (let index = 0; index < arr!.length; index++) {
                                        const element = arr![index];
                                        if (element.element.element.instruction.replace(/\s+/g, '') === p.replace(/\s+/g, '')) {
                                            arr = element.children;
                                        }
                                    }
                                    idx++;
                                }
                                arr?.push(treeEm);
                            }
                            let idxRemove = block.blockContent.get(maximal.variantId)?.indexOf(content);
                            block.blockContent.get(maximal.variantId)?.splice(idxRemove!, 1);
                            console.log("r");
                        }
                    }
                }
                treatedBlocks.push(block);
            }
            treatedVariants.push(maximal);
            let index = variants.indexOf(maximal);
            variants.splice(index, 1);
        }



        console.log("ter");
        let resullt: TreeElement[] = [];
        let deletionPropagations: any[] = [];
        let replacementPropagations: any[] = [];
        let resourcePropagations: any[] = [];
        let pathPropagations: any[] = [];


        let tst = Array.from(mergeResultTree.keys());
        let s = tst[0];
        this.getFileContent(mergeResultTree.get(s)!, resullt);
        let pos = 0;
        let rangeSeeds : any[] =[];
        let blockId = resullt[0].block.blockId;
        let highlightStartLine = 0;
        let highlightStartCharacter = 0;
        let propagationId = 0;
        let lastElement : ElementRange; 
        let propagations: any[] = [];
        let file = "Notepad.java";
        let mandatoryBlockId = this.getMandatoryBlockId(blocks,variantsCount) ;
        let seeds : any[] =[] ;
        
        //TODO Add Last Elements in maps.forge 
        for (let idx = 0; idx < resullt.length; idx++) {
            const element = resullt[idx];
            if (element) {

                await vscode.workspace.openTextDocument(vscode.Uri.parse(s)).then(async (a: vscode.TextDocument) => {
                    await vscode.window.showTextDocument(a, 1, true).then(async e => {
                        await e.edit(edit => {
                            edit.insert(new vscode.Position(pos, element.element.elementRange.start.character), element.element.element.instruction);
                        });
                    });
                    if (element.block.blockId !== blockId) {
                        if (blockId !== mandatoryBlockId) {

                            let propagationElement = {
                                "featureKey": blockId.toString(),
                                "ranges": [
                                    {
                                        "propagationId": propagationId.toString(),
                                        "sourceId": propagationId.toString(),
                                        "startLine": highlightStartLine,
                                        "startColumn": highlightStartCharacter,
                                        "endLine": pos-1,
                                        "endColumn": resullt[idx-1].element.elementRange.end.character,
                                        "isValidated": true,
                                        "isMapped": false,
                                        "analyzer": "Interoperable analyzer",
                                        "isFromMarker": true,
                                        "parent": "-1",
                                        "children": []
                                    }
                                ]
                            };
                            propagations.push(propagationElement);
                            let seedElement = {
                                "id": propagationId,
                                "analyzer": "Interoperable analyzer",
                                "featureKey": blockId.toString(),
                                "startLine": highlightStartLine,
                                "startColumn": highlightStartCharacter,
                                "endLine": pos-1,
                                "endColumn": resullt[idx-1].element.elementRange.end.character,
                                "type": "Deletion",
                                "isValidated": true,
                                "isMapped": false
                            };
                            seeds.push(seedElement) ;
                            propagationId++;
                        }
                        highlightStartCharacter = 0;
                        highlightStartLine = pos ; 
                        blockId = element.block.blockId;
                    }

                    if ((element.element.element.getElementKind() === 5) || (element.element.element.getElementKind() === 11)) {
                        pos = pos + element.element.elementRange.end.line - element.element.elementRange.start.line + 1;
                    }
                    else {
                        pos = pos + 1;
                    }


                }, (error: any) => {
                    console.error(error);
                    debugger;
                });

            }

        }

        let rangeSeedsElement = {
            "file" : file,
            "seeds" : seeds
        };
        rangeSeeds.push(rangeSeedsElement) ;

        let deletionPropagationsElement = {
            "file": file,
            "propagations": propagations
        };
        deletionPropagations.push(deletionPropagationsElement);



/*  end of loop on files*/

        let mapsJson = {
            "deletionPropagations": deletionPropagations,
            "replacementPropagations": replacementPropagations,
            "resourcePropagations": resourcePropagations,
            "pathPropagations": pathPropagations

        };
        let seedsJson = {
            "rangeSeeds" : rangeSeeds,
            "fileSeeds" : []
        };


        console.log(mapsJson);

        await vscode.commands.executeCommand("saveAll");
        await vscode.commands.executeCommand("workbench.action.closeActiveEditor");

        return [JSON.stringify(mapsJson),JSON.stringify(seedsJson)] ;
    }

    static getFileContent(children: TreeElement[], resullt: TreeElement[]) {
        this.orderChildren(children);
        for (const child of children) {
            if (child.children.length === 0) {
                resullt.push(child);
            }
            else {
                resullt.push(child);
                this.getFileContent(child.children, resullt);
            }
        }
    }

    static orderChildren(children: TreeElement[]) {
        children.sort((a, b) => {
            if (a.element.element.parent) {
                if ((a.element.element.instruction.replace(/\s+/g, '') === "}") && (a.element.element.parent?.elementRange.end.line === a.element.elementRange.end.line)) {
                    return 1;
                }
                if ((b.element.element.instruction.replace(/\s+/g, '') === "}") && (b.element.element.parent?.elementRange.end.line === b.element.elementRange.end.line)) {
                    return -1;
                }
            }

            if (a.element.elementRange.start.line >= b.element.elementRange.start.line) {
                return 1;
            }
            else {
                return -1;
            }

        });
    }


    static getMandatoryBlockId(blocks : Block[], variantsCount : number) :number{
        for (const block of blocks) {
            if (Array.from(block.blockContent.keys()).length===variantsCount) {
                return block.blockId ; 
            }
        }
        return -1;

    }
}