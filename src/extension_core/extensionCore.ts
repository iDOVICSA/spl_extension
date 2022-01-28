import * as vscode from "vscode";
import * as json_serializer from "./../json_serializer/json_serializer";
export class ExtensionCore {
  // R map <Element , Map<idArtefact,ElementPosition>>;
  //  R: Map<string, Map<number, vscode.Range[]>> | undefined;

  R: Map<string, Map<number, vscode.Range>> | undefined;

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
      let m: Map<string, Map<number, vscode.Range>> | undefined = this.R;
      console.log(m);
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
        element = element.split(/\s+/).join(" ");
        element = element.trim();
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
        // Create Block
        console.log("block number:  " + blockNumber);

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
          console.log(element.split("@nft")[0]);
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
}
