import { Block } from "../../extension_core/Block";

const natural = require("natural");
const symbolsSeperators = /[-\n._:{}()\s;<>!=+-]+/;
const wordsSeparators: string[] = ["private", "public", "String", "void", "return"];

export class FeatureNamingTfIdf {

  /**
   * 
   * @param identifiedBlocks list of identified blocks 
   * @returns most frequent items "words" per block <blockId, listof words>
   */
  nameBlocks(identifiedBlocks: Block[]) {
    let results = new Map<number, any[]>();
    const tfIdf = natural.TfIdf;
    const tfidf = new tfIdf();
    let numberOfElement = 0;
    for (const block of identifiedBlocks) {
      let blockContent: string = "";
      let variantsOfBlock = Array.from(block.sourceCodeContent.keys());
      /**
       * [0] because all other variants share same instructions and differs
       * only in range which are not important in feature naming
       */
      let blockElements = block.sourceCodeContent.get(variantsOfBlock[0])!;
      numberOfElement = numberOfElement + blockElements.length;
      blockElements.forEach(element => {
        blockContent = blockContent + " " + element.element.instruction;
      });
      blockContent = blockContent.split(symbolsSeperators).join(" "); // eliminates symbols {}();<>=+-!
      blockContent = blockContent.replace(/([a-z])([A-Z])/g, "$1 $2"); // splits upperCamelCase
      wordsSeparators.forEach((seperator) => {
        // eliminates Words in wordsSeperators array
        var regExp = new RegExp(seperator, "g");
        blockContent = blockContent.replace(regExp, "");
      });
      tfidf.addDocument(blockContent);
    }
    for (const block of identifiedBlocks) {
      let sortedElementsOfBlockByTfIdf: any[] = [];
      let maxWords = 20;

      for (const item of tfidf.listTerms(block.blockId)) {
        var frequentWord = { x: item.term, value: item.tfidf };
        sortedElementsOfBlockByTfIdf.push(frequentWord);
        maxWords--;
        if (maxWords < 0) { break; };
      }
      block.tfIdfWordCloud = sortedElementsOfBlockByTfIdf;
      results.set(block.blockId, sortedElementsOfBlockByTfIdf!);
    };
    return results;
  }
}
