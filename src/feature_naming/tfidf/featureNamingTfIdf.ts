const natural = require("natural");
const symbolsSeperators = /[-\n._:{}()\s;<>!=+-]+/;
const wordsSeparators: string[] = ["private", "public", "String","void","return"];

export class FeatureNamingTfIdf {
  nameBlocks(allBlocks: Map<number, string[]>) {
      // Map <blockNumber , frequentItems[]> ; frequentItem <itemName , itemScore> ;
    let results= new Map<number, any[]>() ;
    const tfIdf = natural.TfIdf;
    const tfidf = new tfIdf();
    // Preparation of the block 'tokenization + splitting upperCamelCase' + Preparing Corpus by adding each block as
    // a document to TfIdf constructor ;
    let allBlockArray = Array.from(allBlocks.keys()!);
    allBlockArray.forEach((blockNumber) => {
      let blockElements = allBlocks.get(blockNumber)!;
      let blockContent = blockElements.join(" ");
      blockContent =  blockContent.split(symbolsSeperators).join(" "); // eliminates symbols {}();<>=+-!
      blockContent =  blockContent.replace(/([a-z])([A-Z])/g, "$1 $2"); // splits upperCamelCase
      wordsSeparators.forEach((seperator) => {
        // eliminates Words in wordsSeperators array
        var regExp = new RegExp(seperator, "g");
        blockContent = blockContent.replace(regExp, "");
      });
      tfidf.addDocument(blockContent);
    });

    // returning each block most frequent words
    allBlockArray.forEach((blockNumber) => {
      let cpt: number = 0;
      let sortedElementsOfBlockByTfIdf : any[] = [] ;
      tfidf.listTerms(blockNumber).forEach(function (item: any) {
        var frequentWord = { x: item.term, value: item.tfidf };
        sortedElementsOfBlockByTfIdf.push(frequentWord) ;
        console.log(item.term);
      });
      results.set(blockNumber,sortedElementsOfBlockByTfIdf!);
    });
    return results ; 
  }
}
