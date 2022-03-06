import { start } from "repl";
import * as vscode from "vscode";
import * as json_serializer from "./../json_serializer/json_serializer";
var fs = require("fs");

export class ExtensionCore {
  /**
   * @attribute R :map <Element , Map<idArtefact,ElementPosition>>;
   * @attribute blocks : map <idBlock, listElements>
   */

  R: Map<string, Map<number, vscode.Range | null>> | undefined;

  //blocks <idBlock , listElements>

  blocks: Map<number, string[]> | undefined;
  getRMap(variantsDocs: readonly vscode.TextDocument[]) {
    console.log("there are number of variants =  " + variantsDocs.length);
    if (variantsDocs) {
      this.R = new Map<string, Map<number, vscode.Range>>(); // initialize R
      let idVariant: number = 0;
      variantsDocs.forEach((variant) => {
        if (variant.uri.fsPath) {
          idVariant++;
          this.adapt(variant, idVariant);
        }
      });
    }
    console.log("got R");
  }

  async identifyUsingSemantics(variantsDocs: readonly vscode.TextDocument[]) {
    this.R = new Map<string, Map<number, vscode.Range>>();
    let docsElements: Map<number, string[]> = new Map<
      number,
      string[]
    >();
    let idVariant = 0;

    for (const document of variantsDocs) {
      // this loop to get Symbols of each Variant
      /* const symbols = await vscode.commands.executeCommand<
       vscode.DocumentSymbol[]
     >("vscode.executeDocumentSymbolProvider", document.uri);*/
      let symbols: vscode.DocumentSymbol[] | undefined;
      while (!symbols) {
        await vscode.commands.executeCommand<
          vscode.DocumentSymbol[]
        >("vscode.executeDocumentSymbolProvider", document.uri).then(async (mySymbols) => {
          
          symbols = mySymbols ; 
          console.log("sucess  " + mySymbols);

        }, (reason) => {
          console.log("error  " + reason);
        });
      }


      let result: string[] = [];
      try {
        this.traverseChildren(document, symbols!, "root", "777", 0, document.lineCount, result);// ! need to be handeled
        symbols = undefined ; 
      }
      catch (err) {
        console.log("the error is : " + err);
      }
      docsElements.set(idVariant, result);
      for (let cpt = 0; cpt < result.length; cpt++) {
        let rangeElement = null;
        let element: string = result[cpt];
        // the two next instructions to eliminates multiple spaces
        element = element.split(/\s+/).join(" ").trim();
        //element = element.trim();
        if (element.split("###")[0]) {
          // eliminates \n on the source code file
          if (this.R?.get(element)) {
            /// check if element exists
            let counter: number = 0; // counter for element duplication in the same variant
            while (this.R.get(element)?.get(idVariant)) {
              counter++;
              element = element.split("@$")[0];
              element = element.concat("@$", counter.toString());
            }
            if (counter === 0) {
              this.R.get(element)?.set(idVariant, rangeElement);
            } else {
              if (this.R.get(element)) {
                this.R.get(element)?.set(idVariant, rangeElement);
              } else {
                let rvalue = new Map<number, vscode.Range | null>([
                  [idVariant, rangeElement],
                ]);
                this.R.set(element, rvalue);
              }
            }
          } else {
            let rvalue = new Map<number, vscode.Range | null>([
              [idVariant, rangeElement],
            ]);
            this.R?.set(element, rvalue);
          }
        }
      }
      idVariant++;
    }

  }

  adapt(variant: vscode.TextDocument, idVariant: number) {
    let document: vscode.TextDocument | undefined = variant;
    if (document) {
      let fullText: string = document.getText();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length - 1)
      );
      for (let cpt = 0; cpt < document.lineCount; cpt++) {
        let rangeElement: vscode.Range = document.lineAt(cpt).range;
        let element: string = document.lineAt(cpt).text;
        // the two next instructions to eliminates multiple spaces
        element = element.split(/\s+/).join(" ").trim();
        //element = element.trim();
        if (element) {
          // eliminates \n on the source code file
          if (this.R?.get(element)) {
            /// check if element exists
            let counter: number = 0; // counter for element duplication in the same variant
            while (this.R.get(element)?.get(idVariant)) {
              counter++;
              element = element.split("@$")[0];
              element = element.concat("@$", counter.toString());
            }
            if (counter === 0) {
              this.R.get(element)?.set(idVariant, rangeElement);
            } else {
              if (this.R.get(element)) {
                this.R.get(element)?.set(idVariant, rangeElement);
              } else {
                let rvalue = new Map<number, vscode.Range>([
                  [idVariant, rangeElement],
                ]);
                this.R.set(element, rvalue);
              }
            }
          } else {
            let rvalue = new Map<number, vscode.Range>([
              [idVariant, rangeElement],
            ]);
            this.R?.set(element, rvalue);
          }
        }
      }
    }
  }
  // Map <blockNumber, BlockContent(Array of elements)>
  identifyBlocks(): Map<number, string[]> | undefined {
    const originalValue = this.R;
    const str = JSON.stringify(originalValue, json_serializer.replacer);
    fs.writeFile("input.json", str, function (err: any) {
      if (err) {
        throw err;
      }
      console.log("complete");
    });

    if (this.R) {
      let blockNumber: number = 0;
      while (this.R?.size) {
        let keyOfMostFrequentElement = this.findMostFrequentElement();
        console.log(
          "hey im the most frequent elemtn in R  " + keyOfMostFrequentElement
        );
        let artefactIndexes = Array.from(
          this.R.get(keyOfMostFrequentElement)?.keys()!
        );
        let intersection: string[] =
          this.findElementsContainedInArtefactIndexes(artefactIndexes);
          let blockID : string = '' ;
          let cpt =1 ; 
        for (const e of artefactIndexes) {
          blockID = blockID+e.toString();
        }
        // Create Block
        console.log("block ID:  " + blockID);

        intersection.forEach((element) => {
          if (this.blocks?.get(blockNumber)) {
            //check if block exists
            this.blocks?.get(blockNumber)?.push(element);
          } else {
            // create a new block
            if (blockNumber === 0) {
              this.blocks = new Map<number, string[]>();
            }
            this.blocks?.set(blockNumber, [element]);
          }
          console.log(element.split("###")[0]);
          this.R?.delete(element);
        });
        console.log("******************");
        blockNumber++;
      }
    } else {
      console.log("cant identify blocks from an empty list");
    }
    this.R = JSON.parse(str, json_serializer.reviver);
    return this.blocks;
  }
/**
 * 
 * @returns Most frequent element that appears in maximum of variants 
 */
  findMostFrequentElement() {
    let keyOfMostFrequent: string = "";
    let sizeOfMostFrequent: number = -1;
    if (this.R) {
      Array.from(this.R.keys()).forEach((key) => {
        let currentSize: number = this.R?.get(key)?.size!;
        if (sizeOfMostFrequent < currentSize) {
          keyOfMostFrequent = key;
          sizeOfMostFrequent = currentSize;
        }
      });
    }
    return keyOfMostFrequent;
  }

  findElementsContainedInArtefactIndexes(variantIndexes: number[]): string[] {
    let result: string[] = [];
    if (this.R) {
      Array.from(this.R.keys()).forEach((key) => {
        //if (this.R.get(key)?.values)
        if (this.R?.get(key)) {
          let artefactIndexesForElement = Array.from(this.R.get(key)?.keys()!);
          let condition = this.checkEqualityTwoArrays(
            variantIndexes,
            artefactIndexesForElement
          );
          if (condition) {
            result.push(key);
          }
        }
      });
    }
    return result;
  }

  getBlocksByVariant(blocks: Map<number, string[]>): Map<number, number[]> {
    // Map <variant,blocks[]>
    let blocksByVariant = new Map<number, number[]>();
    let blockNumber = 0;
    let blockArray = Array.from(blocks.keys()!);
    for (let index = 0; index < blockArray.length; index++) {
      const element = blockArray[index];
      let firstElement = blocks.get(blockNumber)![0];
      for (let variantId of this.R?.get(firstElement)?.keys()!) {
        if (blocksByVariant.get(variantId)) {
          blocksByVariant.get(variantId)?.push(blockNumber);
        } else {
          blocksByVariant.set(variantId, [blockNumber]);
        }
      }
      blockNumber++;
    }
    return blocksByVariant;
  }

  checkEqualityTwoArrays(a: any[], b: any[]) {
    a.sort();
    b.sort();
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index])
    );
  }

  traverseChildren(
    document: vscode.TextDocument,
    children: vscode.DocumentSymbol[],
    pathToRoot: string,
    pathToRootTypes: string,
    startingLine: number,
    endingLine: number,
    result: string[] // list of elements (instruction+pathRoot+pathRootTypes)
  ) {
    for (const child of children) {
      if (child.kind !== 3) {
        // if child not a package cause packages have no children according to the API
        if (child.children.length > 0) {
          for (let index = startingLine; index < child.range.start.line; index++) {
            if (document.lineAt(index).text) {
              result.push(document.lineAt(index).text.split(/\s+\t+/).join(" ").trim() + "###" + pathToRoot + "###" + pathToRootTypes);
            }
          }
          console.log("break1") ;
          startingLine = child.range.end.line +1;
          this.traverseChildren(
            document,
            child.children,
            pathToRoot + "." + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, ""),//
            pathToRootTypes + "." + child.kind,
            child.range.start.line,
            child.range.end.line + 1,
            result
          );
        } else {
          if (child.kind === 5) {
            for (let index = startingLine; index < child.range.start.line; index++) {
              if (document.lineAt(index).text) {
                result.push(document.lineAt(index).text.split(/\s+\t+/).join(" ").trim() + "###" + pathToRoot + "###" + pathToRootTypes);
              }
            }
            for (let index = child.range.start.line; index <= child.range.end.line; index++) {
              if (document.lineAt(index).text) {
                result.push(document.lineAt(index).text.split(/\s+\t+/).join(" ").trim() + "###" + pathToRoot + "." + document.lineAt(child.selectionRange.start.line).text.replace(/\s/g, "") + "###" + pathToRootTypes + "." + child.kind);
              }
            }
            startingLine = child.range.end.line + 1;
          }
        }
      }
    }
    for (let index = startingLine; index <endingLine; index++) {
      if (document.lineAt(index).text) {
        result.push(document.lineAt(index).text.split(/\s+\t+/).join(" ").trim() + "###" + pathToRoot + "###" + pathToRootTypes);
      }
    }
  }
  initialR: Map<number, Map<string, vscode.Range[]>> | undefined;
  elementAlreadySelected: Map<number, Array<vscode.Range>> = new Map<number, Array<vscode.Range>>();
  listOfblocks: Map<number, Map<number, Array<vscode.Range>>> = new Map<number, Map<number, vscode.Range[]>>();
  blocksContent: Map<number, string[]> = new Map<number, string[]>();
 
  getinitialR(variantsDocs: readonly vscode.TextDocument[]) {
    console.log("Le nombre de variante  " + variantsDocs.length);
    if (variantsDocs) {
      this.initialR = new Map<number, Map<string, vscode.Range[]>>(); // initialize R
      let idVariant: number = 0;
      variantsDocs.forEach(async (variant) => {
        if (variant.uri.fsPath) {
          idVariant++;
          this.adaptInitialR(variant, idVariant);
        }
      });
    }
  }
  adaptInitialR(variant: vscode.TextDocument, idVariant: number) {
    let document: vscode.TextDocument | undefined = variant;
    let rvalue: Map<string, Array<vscode.Range>> = new Map<string, vscode.Range[]>();
    if (document) {
      let fullText: string = document.getText();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(fullText.length - 1)
      );
      for (let cpt = 0; cpt < document.lineCount; cpt++) {
        let rangeElement: vscode.Range = document.lineAt(cpt).range;
        let element: string = document.lineAt(cpt).text;
        // the two next instructions to eliminates multiple spaces
        element = element.split(/\s+/).join(" ");
        element = element.trim();
        if (element) {
          if (rvalue.get(element)) {
            rvalue.get(element)?.push(rangeElement);
          } else {
            rvalue.set(element, [rangeElement]);
          }
        }
      }
      this.initialR?.set(idVariant, rvalue);
    }
  }
  // Map <blockNumber, BlockContent(Array of elements)>
  identifyInitialBlocks() {
    this.initialR?.forEach((value: Map<string, vscode.Range[]>, variant: number) => {
      value.forEach((value: vscode.Range[], token: string) => {
        value.forEach(element => {
          if (!this.selectedAlready(variant, element)) {
            this.getVariantWhere(token);

          }
        });
      });
    });
  }
  getVariantWhere(token: string) {
    let intersectionList: Map<number, vscode.Range[]> = new Map<number, vscode.Range[]>();
    this.initialR?.forEach((value: Map<string, vscode.Range[]>, variant: number) => {
      if (value.has(token)) {
        let rangesOfElement = value.get(token);
        let stop = false;
        let i = 0;
        let selectedRange;
        while (i < rangesOfElement!.length && !stop) {
          if (!this.selectedAlready(variant, rangesOfElement![i])) {
            stop = true;
            selectedRange = rangesOfElement![i];
          }
          i++;
        }
        if (stop === true && selectedRange) {
          if (this.elementAlreadySelected.get(variant)) {
            this.elementAlreadySelected.get(variant)?.push(selectedRange);
          } else {
            this.elementAlreadySelected.set(variant, [selectedRange]);
          }
          if (intersectionList.get(variant)) {
            intersectionList.get(variant)?.push(selectedRange);
          } else {
            intersectionList.set(variant, [selectedRange]);
          }

        }
      }
    });
    this.makeBlock(intersectionList, token);
  }
  selectedAlready(variant: number, range: vscode.Range): boolean {
    if (this.elementAlreadySelected.get(variant)?.find(element => element === range)) {
      return true;
    }
    return false;
  }
  makeBlock(partOfBlock: Map<number, vscode.Range[]>, content: string) {
    let found = false;
    let stop = false;
    let keyOfBloc = -1;
    let index = 0;
    while (index < this.listOfblocks.size) {
      if (this.listOfblocks.get(index)?.size === partOfBlock.size) {
        found = true;
        keyOfBloc = index;
        partOfBlock.forEach((value: vscode.Range[], variant: number) => {
          if (!this.listOfblocks.get(index)?.has(variant)) {
            found = false;
          }
        });
      }
      index++;
    }
    if (found) {
      partOfBlock.forEach((value: Array<vscode.Range>, variant: number) => {
        value.forEach(element => {
          this.listOfblocks.get(keyOfBloc)?.get(variant)?.push(element);
        });
      });
      this.blocksContent.get(keyOfBloc)?.push(content);
    } else {
      this.blocksContent.set(this.listOfblocks.size, [content]);
      this.listOfblocks.set(this.listOfblocks.size, partOfBlock);
    }
  }
  showBlocksContants() {
    this.blocksContent.forEach((value: string[], blockId: number) => {
      console.log("_________________________________________________________________")
      console.log("Bloc : " + blockId);
      value.forEach(element => {
        console.log(element);

      });
    });
  }




  getIdBlocks() {
    this.listOfblocks.forEach((value: Map<number, Array<vscode.Range>>, blockId: number) => {
      console.log("BLOCK ID " + blockId);
      console.log("MY ELEMENT ARE");
      value.forEach((key: Array<vscode.Range>, elements: number) => {
        console.log(elements);
      });
    });
  }




}
