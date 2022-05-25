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
        let divideFunc: any = vscode.workspace.getConfiguration().get("conf.settingsEditor.divideMethods");
        let pathRootsMap: Map<string,Map<string, boolean>> = new Map<string,Map<string, boolean>>(); // <fileName,<pathRoot,boolean true if set>>
        let treatedBlocks: Block[] = [];
        let treatedFiles: string[] = [];
        let resulltPath = workspaceFolders[0].uri.fsPath.split(workspaceFolders![0].uri.fsPath.split(path.sep).pop()!)[0] + "Result";
        let variantsCount = variants.length;
        let mergeResultTree = new Map<string, TreeElement[]>();

        let treatedVariants: Variant[] = [];
        let pathPropagations: any[] = [];
        let fileSeeds: any[];
        let propagationId = 0;
        let fileIdx =0; 
        while (treatedBlocks.length < blocks.length) {

            let maximal = Utils.getVariantWithMaximalBlocks(variants);
            //blockList - treatedAlreadyBlocks 
            let untreatedBlocks = maximal.blocksList.filter(item => treatedBlocks.indexOf(item) < 0);
            //order blockList :

            Utils.sortBlocksBySize(untreatedBlocks);
            
            for (const block of untreatedBlocks) {
                let blocSourceCodeKeys = Array.from(block.sourceCodeContent.keys());

                while (block.sourceCodeContent.get(maximal.variantId)?.length! > 0) {
                    for (const content of block.sourceCodeContent.get(maximal.variantId)!) {
                        /*for (let cpt=0;cpt<block.sourceCodeContent.get(maximal.variantId)?.length!;cpt++) {
                            let content = block.sourceCodeContent.get(blocSourceCodeKeys[0])![cpt] ;
                            for (let key of blocSourceCodeKeys) {
                                if (block.sourceCodeContent.get(key)![cpt].elementRange.start.line>content.elementRange.start.line) {
                                    content = block.sourceCodeContent.get(key)![cpt] ; 
                                }
                            }*/
                        

                        let filePath = resulltPath + path.sep + content.element.fileName.fsPath.replace(maximal.variantId, "");

                        if (!treatedFiles.includes(filePath)) {
                            fileIdx++ ; 
                            let v = new Map<string,boolean>() ;
                            v.set("root",true) ;
                            pathRootsMap.set(filePath,v );
                            /*let fileinit: string = "";
                            for (let index = 0; index < 1000; index++) {
                                fileinit = fileinit + "\n";
                            }
                            fs.appendFile(filePath, fileinit, function (err) {
                                if (err) { throw err; };
                            });*/
                            mergeResultTree.set(filePath, []);
                            console.log(filePath) ;
                            if (filePath==="c:\HiveBackendVariants\Result\Startup.cs") {
                                debugger ;
                            }
                            treatedFiles.push(filePath);
                        }

                        if (pathRootsMap.get(filePath)?.get(content.getParentPathRoot())) {
                            if (divideFunc.prop1) {
                                pathRootsMap.get(filePath)!.set(content.element.pathToRoot, true);

                            }
                            else {
                                if ((content.element.getElementKind() !== 5) && (content.element.getElementKind() !== 11)) {
                                    if (content.element.getElementParentInstruction().replace(/\s+/g, '') === content.element.instruction.replace(/\s+/g, '')) {
                                        pathRootsMap.get(filePath)!.set(content.element.pathToRoot, true);
                                    }
                                }
                                else {
                                    pathRootsMap.get(filePath)!.set(content.element.pathToRoot, true);
                                }
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
                            let idxRemove = block.sourceCodeContent.get(maximal.variantId)?.indexOf(content);
                            block.sourceCodeContent.get(maximal.variantId)?.splice(idxRemove!, 1);
                        }
                    }
                }
                //let pr = await this.addMediaFilesToMaximalProject(resulltPath, block, 5);
                //pathPropagations.push(pr) ;
                //propagationId = propagationId+pr.length +1 ; 
                treatedBlocks.push(block);
            }
            treatedVariants.push(maximal);
            let index = variants.indexOf(maximal);
            variants.splice(index, 1);
        }




        let deletionPropagations: any[] = [];
        let replacementPropagations: any[] = [];
        let resourcePropagations: any[] = [];
        let rangeSeeds: any[] = [];
        let allFiles = Array.from(mergeResultTree.keys());
        for (let idx = 0; idx < allFiles.length; idx++) {
            
            let s = allFiles[idx];
            console.log(s) ;
            let resullt: TreeElement[] = [];
            this.getFileContent(mergeResultTree.get(s)!, resullt);
            let pos = 0;
            let blockId = resullt[0].block.blockId;
            let highlightStartLine = 0;
            let highlightStartCharacter = 0;

            let propagations: any[] = [];
            let file = s.replace(resulltPath + path.sep, "");
            let mandatoryBlockId = this.getMandatoryBlockId(blocks, variantsCount);
            let seeds: any[] = [];
            let str: string[] = [];

            for (let idx = 0; idx < resullt.length; idx++) {

                const element = resullt[idx];
                str[idx] = element.element.element.instruction ;
              

                if (element.element.getParent() !== "root") {
                    if (!element.element.element.symbol) {
                        if (element.element.elementRange.start.line < element.element.element.parent?.element.symbol?.selectionRange.start.line!) {
                            str.splice(idx - 1, 0, element.element.element.instruction);
                            str.splice(idx + 1, 1);
                        }
                    }
                }


                if (element) {
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
                                        "endLine": pos - 1,
                                        "endColumn": resullt[idx - 1].element.element.instruction.length+2,
                                        "isValidated": true,
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
                                "endLine": pos - 1,
                                "endColumn": resullt[idx - 1].element.element.instruction.length+2,
                                "type": "Deletion",
                                "isValidated": true,
                            };
                            seeds.push(seedElement);
                            propagationId++;
                        }
                        highlightStartCharacter = 0;
                        highlightStartLine = pos;
                        blockId = element.block.blockId;
                    }
                    if (divideFunc.prop1) {
                        pos = pos + 1;
                    }
                    else {
                        if ((element.element.element.getElementKind() === 5) || (element.element.element.getElementKind() === 11)) {
                            pos = pos + element.element.elementRange.end.line - element.element.elementRange.start.line + 1;
                        }
                        else {
                            pos = pos + 1;
                        }
                    }

                }
            }
            let element = resullt.pop()!;
            resullt.push(element!);
            if (blockId !== mandatoryBlockId) {
                let endLine: number;
                if (divideFunc.prop1) {
                    endLine = pos - 1;

                }
                else {
                    if ((element.element.element.getElementKind() === 5) || (element.element.element.getElementKind() === 11)) {
                        endLine = pos - (element.element.elementRange.end.line - element.element.elementRange.start.line + 1);
                    }
                    else {
                        endLine = pos - 1;
                    }
                }
                let propagationElement : any ;
                try {
                    propagationElement = {
                        "featureKey": blockId.toString(),
                        "ranges": [
                            {
                                "propagationId": propagationId.toString(),
                                "sourceId": propagationId.toString(),
                                "startLine": highlightStartLine,
                                "startColumn": highlightStartCharacter,
                                "endLine": endLine!,
                                "endColumn": resullt[idx - 1].element.element.instruction.length+2,
                                "isValidated": true,
                                "isMapped": false,
                                "analyzer": "Interoperable analyzer",
                                "isFromMarker": true,
                                "parent": "-1",
                                "children": []
                            }
                        ]
                    };
                }
                catch (err) {
                    console.log(err);              
               }
            
                propagations.push(propagationElement);
                let seedElement : any ; 
                try {
                    seedElement = {
                        "id": propagationId,
                        "analyzer": "Interoperable analyzer",
                        "featureKey": blockId.toString(),
                        "startLine": highlightStartLine,
                        "startColumn": highlightStartCharacter,
                        "endLine": endLine!,
                        "endColumn": resullt[idx - 1].element.element.instruction.length+2,
                        "type": "Deletion",
                        "isValidated": true,
                        "isMapped": false
                    };
                } 
                catch(err) {
                    console.log(err) ;
                }
             
                seeds.push(seedElement);
                propagationId++;
            }
            let dirs = file.split(path.sep);
            dirs.pop();
            let dir = resulltPath + path.sep + dirs.join(path.sep);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            await fs.writeFile(resulltPath + path.sep + file, str.join("\n"), 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }
                console.log("Code file has been saved.");
            });
            let rangeSeedsElement: any;
            if (seeds.length > 0) {
                rangeSeedsElement = {
                    "file": file,
                    "seeds": seeds
                };
                rangeSeeds.push(rangeSeedsElement);
            }
            let deletionPropagationsElement: any;
            if (propagations.length > 0) {
                deletionPropagationsElement = {
                    "file": file,
                    "propagations": propagations
                };
                deletionPropagations.push(deletionPropagationsElement);
            }


        }














        /*  end of loop on files*/

        let mapsJson = {
            "deletionPropagations": deletionPropagations,
            "replacementPropagations": replacementPropagations,
            "resourcePropagations": resourcePropagations,
            "pathPropagations": pathPropagations

        };
        let seedsJson = {
            "rangeSeeds": rangeSeeds,
            "fileSeeds": []
        };


        return [JSON.stringify(mapsJson), JSON.stringify(seedsJson)];
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

            if (a.element.getDistanceToParent() >= b.element.getDistanceToParent()) {
                return 1;
            }
            else {
                return -1;
            }

        });
    }


    static getMandatoryBlockId(blocks: Block[], variantsCount: number): number {
        for (const block of blocks) {
            if (Array.from(block.sourceCodeContent.keys()).length === variantsCount) {
                return block.blockId;
            }
        }
        return -1;

    }

    static async addMediaFilesToMaximalProject(resulltPath: string, block: Block, propagationId: number): Promise<any[]> {
        let pathPropagations: any[] = [];
        let firstKey = Array.from(block.sourceCodeContent.keys())[0];
        for (const file of block.mediaContent) {
            let fileUri = vscode.Uri.file(firstKey + file);
            let t = file.split(path.sep);
            let target = vscode.Uri.file(resulltPath + path.sep + t.join(path.sep));
            let pathPropagationElement = {
                "propagationId": propagationId.toString(),
                "sourceId": propagationId.toString(),
                "propagatedPath": file,
                "featureKey": block.blockId.toString(),
                "isValidated": true,
                "isMapped": false,
                "analyzer": "File system analyzer",
                "isFromMarker": true
            };
            let seedElement;
            propagationId++;
            pathPropagations.push(pathPropagationElement);


            await vscode.workspace.fs.copy(fileUri, target);
        }
        return pathPropagations;

    }

}