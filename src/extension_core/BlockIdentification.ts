import * as vscode from "vscode";
import { CodeFilesExtensions } from "../Utils/FilesExtensions";
import { ElementRangesMapDecorator } from "../Utils/MapDecorator/ElementRangesMapDecorator";
import { Utils } from "../Utils/Utilis";
import { Block } from "./Block";
import { Element } from "./Element";
import { ElementRange } from "./ElementRange";

/**
BlockIdentification using Interdependant Elements Algorithm 
*/
import { ExtensionCore } from "./extensionCore";
import { Variant } from "./Variant";
import * as path from 'path';

export class BlockIdentification {
    async identifyBlocks(filesVariants: Map<string, string[]>): Promise<Block[]> { // <File, listOfVariants Where the file appears>
        let allFiles = Array.from(filesVariants.keys());
        for (const file of allFiles) {
            let variantsOfTheFile = filesVariants.get(file)!;
            //check if all the files have same content
            let documentsByVariant = new Map<string, vscode.TextDocument>(); // <idVariant , Document>
            for (const v of variantsOfTheFile) {
                let filePath = vscode.Uri.parse(v + path.sep + file);
                let filePath2 = vscode.Uri.joinPath(vscode.Uri.parse(v), file);
                let fileExtension = filePath.fsPath.split(".").pop()!;

                if (fileExtension in CodeFilesExtensions) {
                    let document = await vscode.workspace.openTextDocument(filePath.fsPath);
                    documentsByVariant.set(v, document);
                }
                else {
                    console.log(fileExtension + "  noooo");
                }
            }
            if (documentsByVariant.size > 0) {
                await this.fillRMap(documentsByVariant);
                this.identifyInitialBlocks();
                documentsByVariant.clear;
            }
        }
        return this.blocks;
    }
    async checkCodeFilesSimilarity(documents: readonly vscode.TextDocument[]) {

        console.log("_______________________" + documents[0].fileName + "_____________________");
        let ec = new ExtensionCore();
        await ec.identifyUsingSemantics(documents);
        ec.identifyBlocks();
        console.log("___________________________________________________________________________");

        /*    let extensionCore = new ExtensionCore();
            extensionCore.getinitialR(documents);
            extensionCore.identifyInitialBlocks();
            extensionCore.getIdBlocks() ;
            extensionCore.showBlocksContants();
            console.log("_________________________________________________________________");*/

    }
    //<variantId , Map<Element,vscode.Range[]>>
    rMap?: Map<string, Map<Element, vscode.Range[]>>;
    elementAlreadySelected: Map<string, Array<vscode.Range>> = new Map<string, Array<vscode.Range>>();
    blocks: Block[] = [];

    async fillRMap(comparableFilesByVariant: Map<string, vscode.TextDocument>) {
        this.rMap = new Map<string, Map<Element, vscode.Range[]>>();
        let variantsOfTheFile = Array.from(comparableFilesByVariant.keys());
        for (const variantId of variantsOfTheFile) {
            let file = comparableFilesByVariant.get(variantId);
            try {
                await this.adaptSourceFile(file!, variantId);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    /**
     * 
     * @param document 
     * @param variantId 
     * fills the rMap
     */
    async adaptSourceFile(document: vscode.TextDocument, variantId: string) {
        
        let rValue: ElementRangesMapDecorator = new ElementRangesMapDecorator(new Map<Element, vscode.Range[]>());
        let fileSymbols: vscode.DocumentSymbol[] | undefined;

        while (!fileSymbols) {
            await vscode.commands.executeCommand<
                vscode.DocumentSymbol[]
            >("vscode.executeDocumentSymbolProvider", document.uri).then(async (mySymbols) => {
                fileSymbols = mySymbols;
                console.log("sucess  " + mySymbols);
            }, (reason) => {
                console.log("error  " + reason);
            });
        }
        let result: ElementRange[] = [];
        try {
            this.traverseSymbolsChildren(document, undefined, undefined, fileSymbols!, "root", "777", 0, document.lineCount, result);
            fileSymbols = undefined;
        }
        catch (err) {
            console.log(err);
        }
        for (let cpt = 0; cpt < result.length; cpt++) {
            let rangeElement: vscode.Range = result[cpt].elementRange;
            let element: Element = result[cpt].element;
            if (element) {
                rValue.add(element, rangeElement);
            }
        }
        this.rMap?.set(variantId, rValue.getMapObject());
    }

    traverseSymbolsChildren(
        document: vscode.TextDocument,
        elementParent: ElementRange | undefined,
        parentSymbol: vscode.DocumentSymbol | undefined,
        children: vscode.DocumentSymbol[],
        pathToRoot: string,
        pathToRootTypes: string,
        startingLine: number,
        endingLine: number,
        result: ElementRange[] // list of elements (instruction+pathRoot+pathRootTypes)
    ) {
        for (const child of children) {
            if (child.kind !== 3) {
                // if child not a package cause packages have no children according to the API
                if (child.children.length > 0) {
                    //if (child.range.start.line!==child.range.end.line) {
                    if ((child.kind !== 5) && (child.kind !== 11)) { // some methods and functions have childrens like callbacks and method font in actions.java of notepad which have class child !!
                        for (let index = startingLine; index <child.range.start.line; index++) {
                            if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {
                                let e = new Element(document.lineAt(index).text, pathToRoot, pathToRootTypes, document.uri, elementParent);

                                let r: vscode.Range;
                                if ((parentSymbol) && (e.instruction.replace(/\s+/g, '') === e.getElementParentInstruction().replace(/\s+/g, ''))) {
                                    r = parentSymbol?.range!;
                                }
                                else {
                                    r = document.lineAt(index).range;
                                }
                                let er = new ElementRange(e, r!);
                                result.push(er);
                            }
                        }
                        startingLine = child.range.end.line + 1;

                        let newParent = new Element(document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, elementParent);
                        let newParentRange = child.range;
                        let newParentElementRange = new ElementRange(newParent, newParentRange);
                        this.traverseSymbolsChildren(
                            document,
                            newParentElementRange,
                            child,
                            child.children,
                            pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""),//
                            pathToRootTypes + "." + child.kind,
                            child.range.start.line,
                            child.range.end.line + 1,
                            result
                        );
                    }
                    else {
                        for (let index = startingLine; index < child.range.start.line; index++) {
                            if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {
                                let e = new Element(document.lineAt(index).text, pathToRoot, pathToRootTypes, document.uri, elementParent);
                                let r: vscode.Range;
                                if ((parentSymbol) && (e.instruction.replace(/\s+/g, '') === e.getElementParentInstruction().replace(/\s+/g, ''))) {
                                    r = parentSymbol?.range!;
                                }
                                else {
                                    r = document.lineAt(index).range;
                                }
                                let er = new ElementRange(e, r);
                                result.push(er);
                            }
                        }

                        let e = new Element(document.getText(child.range), pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, elementParent);
                        let r = child.range;
                        let er = new ElementRange(e, r);
                        result.push(er);
                        startingLine = child.range.end.line + 1;
                    }
                } else {
                    if ((child.kind === 5) || ((child.kind === 11)) || (child.kind === 8)) {
                        for (let index = startingLine; index < child.range.start.line; index++) {
                            if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {
                                let e = new Element(document.lineAt(index).text, pathToRoot, pathToRootTypes, document.uri, elementParent);
                                let r: vscode.Range;
                                if ((parentSymbol) && (e.instruction.replace(/\s+/g, '') === e.getElementParentInstruction().replace(/\s+/g, ''))) {
                                    r = parentSymbol?.range!;
                                }
                                else {
                                    r = document.lineAt(index).range;
                                }
                                let er = new ElementRange(e, r);
                                result.push(er);
                            }
                        }

                        if (child.kind === 8) {
                            let newP: ElementRange;
                            for (let index = child.range.start.line; index <= child.range.end.line; index++) {
                                let e: Element;
                                if (index === child.range.start.line) {
                                    e = new Element(document.lineAt(index).text, pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, elementParent);
                                }
                                else {
                                    e = new Element(document.lineAt(index).text, pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, newP!);
                                }

                                let r: vscode.Range;
                                if ((parentSymbol) && (e.instruction.replace(/\s+/g, '') === e.getElementParentInstruction().replace(/\s+/g, ''))) {
                                    r = child.range!;
                                }
                                else {
                                    r = document.lineAt(index).range;

                                }
                                let er = new ElementRange(e, r);
                                if (index === child.range.start.line) {
                                    newP = er;
                                }
                                result.push(er);
                            }
                            startingLine = child.range.end.line + 1;
                        }

                        else {
                            let e = new Element(document.getText(child.range), pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, elementParent);
                            let r = child.range;
                            let er = new ElementRange(e, r);
                            result.push(er);
                            startingLine = child.range.end.line + 1;
                        }

                    }

                }
            }
        }
        for (let index = startingLine; index < endingLine; index++) {
            if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {
                //let e = new Element(document.lineAt(index).text.split(/\s+\t+/).join(" ").trim(), pathToRoot, pathToRootTypes);
                let e = new Element(document.lineAt(index).text, pathToRoot, pathToRootTypes, document.uri, elementParent);
                let r = document.lineAt(index).range;
                let er = new ElementRange(e, r);
                result.push(er);
            }
        }
    }

    identifyInitialBlocks() {
        this.rMap?.forEach((value: Map<Element, vscode.Range[]>, variantId: string) => {
            value.forEach((elementRange: vscode.Range[], element: Element) => {
                elementRange.forEach(range => {
                    if (!this.selectedAlready(variantId, range)) {
                        this.getVariantWhere(element);
                    }
                });
            });
        });
        console.log("_______________Blocks___________________");
        console.log(this.blocks);
        console.log("________________________________________");

    }
    //verify if the element is already selected
    selectedAlready(variantId: string, range: vscode.Range): boolean {
        if (this.elementAlreadySelected.get(variantId)?.find(element => element === range)) {
            return true;
        }
        return false;
    }
    //return list of similair element of diffrent variant
    getVariantWhere(element: Element) {
        let intersectionList: Map<string, ElementRange[]> = new Map<string, ElementRange[]>();
        this.rMap?.forEach((value: Map<Element, vscode.Range[]>, variantId: string) => {
            let elementSelected = this.elementInVariant(element, variantId);
            if (elementSelected) {
                let rangesOfElement = value.get(elementSelected);
                let stop = false;
                let i = 0;
                let selectedRange;
                let er: ElementRange;
                while (i < rangesOfElement!.length && !stop) {
                    if (!this.selectedAlready(variantId, rangesOfElement![i])) {
                        stop = true;
                        selectedRange = rangesOfElement![i];
                        er = new ElementRange(elementSelected, selectedRange);
                    }
                    i++;
                }
                if (stop === true && selectedRange) {
                    if (this.elementAlreadySelected.get(variantId)) {
                        this.elementAlreadySelected.get(variantId)?.push(selectedRange);
                    } else {
                        this.elementAlreadySelected.set(variantId, [selectedRange]);
                    }
                    if (intersectionList.get(variantId)) {
                        intersectionList.get(variantId)?.push(er!);
                    } else {
                        intersectionList.set(variantId, [er!]);
                    }

                }
            }
        });
        this.makeBlock(intersectionList);
    }

    //return element if exist in a variant
    elementInVariant(element: Element, variantID: string): Element | undefined {
        let variant = this.rMap?.get(variantID);
        let elements = Array.from(variant!.keys());
        let stop = false;
        let selectedElementIndice = 0;
        let i = 0;
        while (!stop && i < elements.length) {

            if (elements[i].isEqual(element) === true) {
                stop = true;
                selectedElementIndice = i;
            };
            i++;
        }
        if (stop) {
            return elements[selectedElementIndice];
        }
        return undefined;
    }

    makeBlock(partOfBlock: Map<string, ElementRange[]>) {
        let found = false;
        let stop = false;
        let keyOfBloc = -1;
        let index = 0;
        while (index < this.blocks.length) {
            if (this.blocks[index].havingSameBlockId(partOfBlock)) {
                found = true;
                keyOfBloc = index;
            }
            index++;
        }
        if (found) {
            this.blocks[keyOfBloc].addElementRangeToBlock(partOfBlock);

        } else {
            let idBlock = this.createBlockId(partOfBlock);
            let b = new Block(this.blocks.length, "Block " + this.blocks.length, partOfBlock);
            this.blocks.push(b);

        }
    }
    createBlockId(intersection: Map<string, ElementRange[]>): string {
        let resullt = "";
        let allVariants = Array.from(intersection.keys());
        allVariants.sort((a, b) => a.localeCompare(b));
        resullt = allVariants.toString();
        return resullt;
    }

}



