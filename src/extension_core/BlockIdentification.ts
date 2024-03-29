import * as vscode from "vscode";
import { CodeFilesExtensions, MediaFilesExtsensions } from "../Utils/FilesExtensions";
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
    divideFunc: boolean = true;
    async identifyBlocksInit(filesVariants: Map<string, string[]>, divideFunc: boolean): Promise<Block[]> { // <File, listOfVariants Where the file appears>
        this.divideFunc = divideFunc;
        let allFiles = Array.from(filesVariants.keys());
        for (const file of allFiles) {
            let variantsOfTheFile = filesVariants.get(file)!;
            //check if all the files have same content
            let sourceCodedocumentsByVariant = new Map<string, vscode.TextDocument>(); // <idVariant , Document>
            let mediaDocuments = new Map<string, string>();
            for (const v of variantsOfTheFile) {
                //let filePath = v + path.sep + file;
                let filePath = v + file;

                let fileExtension = filePath.split(".").pop()!;


                if (fileExtension in CodeFilesExtensions) {
                    let document = await vscode.workspace.openTextDocument(filePath);
                    sourceCodedocumentsByVariant.set(v, document);
                }
                else {
                    if (fileExtension in MediaFilesExtsensions) {
                        mediaDocuments.set(v, file);
                    }
                    else {
                        console.log(fileExtension + "  not supported  yet");
                    }
                }
            }
            if (sourceCodedocumentsByVariant.size > 0) {
                await this.fillRMapInit(sourceCodedocumentsByVariant);
              
                sourceCodedocumentsByVariant.clear;
            }

        }
        return this.blocks;
    }
    async identifyBlocks(filesVariants: Map<string, string[]>, divideFunc: boolean): Promise<Block[]> { // <File, listOfVariants Where the file appears>
        this.divideFunc = divideFunc;
        let allFiles = Array.from(filesVariants.keys());
        for (const file of allFiles) {
            let variantsOfTheFile = filesVariants.get(file)!;
            //check if all the files have same content
            let sourceCodedocumentsByVariant = new Map<string, vscode.TextDocument>(); // <idVariant , Document>
            let mediaDocuments = new Map<string, string>();
            for (const v of variantsOfTheFile) {
                //let filePath = v + path.sep + file;
                let filePath = v + file;

                let fileExtension = filePath.split(".").pop()!;


                if (fileExtension in CodeFilesExtensions) {
                    let document = await vscode.workspace.openTextDocument(filePath);
                    sourceCodedocumentsByVariant.set(v, document);
                }
                else {
                    if (fileExtension in MediaFilesExtsensions) {
                        mediaDocuments.set(v, file);
                    }
                    else {
                        console.log(fileExtension + "  not supported  yet");
                    }
                }
            }
            if (sourceCodedocumentsByVariant.size > 0) {
                await this.fillRMap(sourceCodedocumentsByVariant);
                this.identifyInitialBlocks();
                sourceCodedocumentsByVariant.clear;
            }
            if (mediaDocuments.size > 0) {
                this.addMediaToblock(mediaDocuments);
                mediaDocuments.clear;
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


    async fillRMapInit(comparableFilesByVariant: Map<string, vscode.TextDocument>) {
        this.rMap = new Map<string, Map<Element, vscode.Range[]>>();
        let variantsOfTheFile = Array.from(comparableFilesByVariant.keys());
        for (const variantId of variantsOfTheFile) {
            let file = comparableFilesByVariant.get(variantId);
            try {
                await this.adaptSourceFileInit(file!, variantId);
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
        let fileSymbols: (vscode.DocumentSymbol | vscode.SymbolInformation)[] | undefined;

        while (!fileSymbols) {
            await vscode.commands.executeCommand<
            (vscode.DocumentSymbol|vscode.SymbolInformation)[]
            >("vscode.executeDocumentSymbolProvider", document.uri).then(async (mySymbols) => {
                fileSymbols = mySymbols;
                console.log("sucess  :" + document.uri.fsPath + "  " + mySymbols);
            }, (reason) => {
                console.log("error  " + reason);
            });
        }
        let result: ElementRange[] = [];
        try {
            if (this.divideFunc) {
                this.traverseSymbolsChildrenDivideAll(document, undefined, undefined, fileSymbols! as vscode.DocumentSymbol[], "root", "777", 0, document.lineCount, result);
            }
            else {
                this.traverseSymbolsChildren(document, undefined, undefined, fileSymbols!  as vscode.DocumentSymbol[], "root", "777", 0, document.lineCount, result);

            }
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


    async adaptSourceFileInit(document: vscode.TextDocument, variantId: string) {


        await vscode.window.showTextDocument(document,1,false) ;

       
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
    }



















    traverseSymbolsChildrenDivideAll(
        document: vscode.TextDocument,
        elementParent: ElementRange | undefined,
        parentSymbol: vscode.DocumentSymbol | undefined,
        children: vscode.DocumentSymbol[],
        pathToRoot: string,
        pathToRootTypes: string,
        startingLine: number,
        endingLine: number,
        result: ElementRange[]
    ) {
        for (const child of children) {
            if (child.kind !== 3) {
                // if child not a package cause packages have no children according to the API
                if (child.children.length > 0) {
                    //if (child.range.start.line!==child.range.end.line) {
                    // some methods and functions have childrens like callbacks and method font in actions.java of notepad which have class child !!
                    for (let index = startingLine; index < child.range.start.line; index++) {
                        if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {
                            let e = new Element(document.lineAt(index).text, pathToRoot, pathToRootTypes, document.uri, elementParent);
                            e.parent = elementParent ;
                            let r: vscode.Range;
                            if ((parentSymbol) && (e.instruction.replace(/\s+/g, '') === e.getElementParentInstruction().replace(/\s+/g, ''))) {
                                r = parentSymbol?.range!;
                                e.symbol = parentSymbol;
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
                    newParent.symbol = child;
                    newParent.parent = elementParent ; //
                    let newParentRange = child.range;
                    let newParentElementRange = new ElementRange(newParent, newParentRange);
                    this.traverseSymbolsChildrenDivideAll(
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


                } else {
                    if ((child.kind === 5) || ((child.kind === 11)) || (child.kind === 8)) {
                        for (let index = startingLine; index < child.range.start.line; index++) {
                            if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {
                                let e = new Element(document.lineAt(index).text, pathToRoot, pathToRootTypes, document.uri, elementParent);
                                e.parent = elementParent ; 
                                let r: vscode.Range;
                                if ((parentSymbol) && (e.instruction.replace(/\s+/g, '') === e.getElementParentInstruction().replace(/\s+/g, ''))) {
                                    r = parentSymbol?.range!;
                                    e.symbol = child;
                                }
                                else {
                                    r = document.lineAt(index).range;
                                }
                                let er = new ElementRange(e, r);
                                result.push(er);
                            }
                        }


                        let newP: ElementRange;
                        let e = new Element(document.lineAt(child.selectionRange.start.line).text, pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, elementParent);
                        let r = child.range!;
                        e.symbol = child;
                        e.parent = elementParent ;
                        newP = new ElementRange(e, r);
                        for (let index = child.range.start.line; index <= child.range.end.line; index++) {
                            if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {

                                if (index === child.selectionRange.start.line) {
                                    let e = new Element(document.lineAt(child.selectionRange.start.line).text, pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, elementParent);
                                    let r = child.range!;
                                    e.symbol = child;
                                    e.parent = newP ; 
                                    let ers = new ElementRange(e,r) ;
                                    result.push(ers);
                                }
                                else {
                                    let e: Element;
                                    e = new Element(document.lineAt(index).text, pathToRoot + "@@" + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""), pathToRootTypes + "." + child.kind, document.uri, newP!);
                                    e.parent = newP ;
                                    let r = document.lineAt(index).range;
                                    let er = new ElementRange(e, r);
                                    result.push(er);

                                }
                            }
                        }
                        startingLine = child.range.end.line + 1;

                    }

                }
            }
        }
        for (let index = startingLine; index < endingLine; index++) {
            if (Utils.stringIsNotEmpty(document.lineAt(index).text)) {
                //let e = new Element(document.lineAt(index).text.split(/\s+\t+/).join(" ").trim(), pathToRoot, pathToRootTypes);
                let e = new Element(document.lineAt(index).text, pathToRoot, pathToRootTypes, document.uri, elementParent);
                e.parent = elementParent ;
                let r: vscode.Range;
                if ((parentSymbol) && (e.instruction.replace(/\s+/g, '') === e.getElementParentInstruction().replace(/\s+/g, ''))) {
                    r = parentSymbol?.range!;
                    e.symbol = parentSymbol ;//
                }
                else {
                    r = document.lineAt(index).range;
                }
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

            if (elements[i].isEqual(element, this.divideFunc) === true) {
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
    createBlockId(intersection: Map<string, ElementRange[] | string>): string {
        let resullt = "";
        let allVariants = Array.from(intersection.keys());
        allVariants.sort((a, b) => a.localeCompare(b));
        resullt = allVariants.toString();
        return resullt;
    }
    addMediaToblock(mediaDocuments: Map<string, string>) {
        let found = false;
        let stop = false;
        let keyOfBloc = -1;
        let index = 0;
        while ((index < this.blocks.length) && (!found)) {
            if (this.blocks[index].havingSameBlockId(mediaDocuments)) {
                found = true;
                keyOfBloc = index;
            }
            index++;
        }
        let m = Array.from(mediaDocuments.keys());
        let s = m[0];
        if (found) {
            this.blocks[keyOfBloc].mediaContent?.push(mediaDocuments.get(s)!);
        } else {
            let idBlock = this.createBlockId(mediaDocuments);
            let b = new Block(this.blocks.length, "Block " + this.blocks.length, new Map<string, ElementRange[]>());
            b.mediaContent?.push(mediaDocuments.get(s)!);
            let variantsIds = Array.from(mediaDocuments.keys());
            for (const variantId of variantsIds) {
                b.sourceCodeContent.set(variantId, []);
            }
            this.blocks.push(b);
        }
    }

}



