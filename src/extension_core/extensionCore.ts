import * as vscode from "vscode";

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

        if (this.R?.get(element)) {
          this.R.get(element)?.set(idVariant, rangeElement);
        } else {
          let rvalue = new Map<number, vscode.Range>([
            [idVariant, rangeElement],
          ]);
          this.R?.set(element, rvalue);
        }
      }
    }
  }

  identifyBlocks() {
    let copyOfR = this.R;
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
        blockNumber++;
        intersection.forEach((element) => {
          console.log(element);
          this.R?.delete(element);
        });
        console.log("******************");
      }
    } else {
      console.log("cant identify blocks from an empty list");
    }
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
