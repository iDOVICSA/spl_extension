
/** 
Block Structure class 
*/

import { Color } from "./Color";
import { Element } from "./Element";
import { ElementRange } from "./ElementRange";

export class Block {
  blockId: number; // sequential id
  blockName: string | undefined;  //generated by feature Naming activity Or by user input 
  sourceCodeContent: Map<string, ElementRange[]>; // // Map <variantId , lines of the file>
  mediaContent: string[] = [];
  tfIdfWordCloud: any[] = [];
  colorOfBlock: string = "#082567";
  percentageOfBlock: number = 0.1;


  constructor(blockId: number, blockName: string | undefined, blockContent: Map<string, ElementRange[]>) {
    this.blockId = blockId;
    this.blockName = blockName;
    this.sourceCodeContent = blockContent;
    if (Color.listOfColor[blockId]) {
      this.colorOfBlock = Color.listOfColor[blockId];
    }
  }

  addElementRangeToBlock(partOfBlock: Map<string, ElementRange[]>) {
    partOfBlock.forEach((value: ElementRange[], variantId: string) => {
      value.forEach(item => this.sourceCodeContent?.get(variantId)?.push(item));
    });
  }

  /**
   * Checks if intersectionId equals to this.blockId
   * @param intersection <VariantId, ElementRange>
   * @returns 
   */
  havingSameBlockId(intersection: Map<string, ElementRange[] | string>): boolean {
    let resullt = "";
    let allVariants = Array.from(intersection.keys());
    allVariants.sort((a, b) => a.localeCompare(b));
    resullt = allVariants.toString();

    let thisAllVariatns = Array.from(this.sourceCodeContent.keys());
    thisAllVariatns.sort((a, b) => a.localeCompare(b));
    let resullt2 = thisAllVariatns.toString();

    return resullt === resullt2;
  }
}
