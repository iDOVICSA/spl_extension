import { Block } from "../../extension_core/Block";

const natural = require("natural");
const symbolsSeperators = /[-\n._:{}()\s;<>!=+-]+/;
const wordsSeparators: string[] = ["private", "public", "String", "void", "return"];

export class FeatureNamingTfIdf {
  /* nameBlocks(allBlocks: Map<number, string[]>): Map<number, any[]> {
     // Map <blockNumber , frequentItems[]> ; frequentItem <itemName , itemScore> ;
     let results = new Map<number, any[]>();
     const tfIdf = natural.TfIdf;
     const tfidf = new tfIdf();
     // Preparation of the block 'tokenization + splitting upperCamelCase' + Preparing Corpus by adding each block as
     // a document to TfIdf constructor ;
     let allBlockArray = Array.from(allBlocks.keys()!);
     allBlockArray.forEach((blockNumber) => {
       let blockElements = allBlocks.get(blockNumber)!;
       //this update is due to adding pathRoot+pathRootType to elements {
       let blockContent: string = "";
       blockElements.forEach(element => {
         blockContent = blockContent + " " + element.split("###")[0];
       });
 
       //  let blockContent = blockElements.join(" ");
       blockContent = blockContent.split(symbolsSeperators).join(" "); // eliminates symbols {}();<>=+-!
       blockContent = blockContent.replace(/([a-z])([A-Z])/g, "$1 $2"); // splits upperCamelCase
       wordsSeparators.forEach((seperator) => {
         // eliminates Words in wordsSeperators array
         var regExp = new RegExp(seperator, "g");
         blockContent = blockContent.replace(regExp, "");
       });
       tfidf.addDocument(blockContent);
     });
 
     // returning each block most frequent words
     allBlockArray.forEach((blockNumber) => {
       let sortedElementsOfBlockByTfIdf: any[] = [];
       tfidf.listTerms(blockNumber).forEach(function (item: any) {
         var frequentWord = { x: item.term, value: item.tfidf };
         sortedElementsOfBlockByTfIdf.push(frequentWord);
       });
       results.set(blockNumber, sortedElementsOfBlockByTfIdf!);
     });
     return results;
   }*/

  /**
   * 
   * @param identifiedBlocks list of identified blocks 
   * @returns most frequent items "words" per block <blockId, listof words>
   */
  nameBlocks(identifiedBlocks: Block[]) {
    let results = new Map<number, any[]>();
    const tfIdf = natural.TfIdf;
    const tfidf = new tfIdf();
    for (const block of identifiedBlocks) {
      let blockContent: string = "";
      let variantsOfBlock = Array.from(block.blockContent.keys());
      /**
       * [0] because all other variants share same instructions and differs
       * only in range which are not important in feature naming
       */
      let blockElements = block.blockContent.get(variantsOfBlock[0])!;
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

      /*tfidf.listTerms(block.blockId).forEach(function (item: any) {
        var frequentWord = { x: item.term, value: item.tfidf };
        sortedElementsOfBlockByTfIdf.push(frequentWord);
        maxWords-- ; 
        
      });*/
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
