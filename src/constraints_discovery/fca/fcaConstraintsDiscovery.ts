import { Block } from "../../extension_core/Block";
import { Variant } from "../../extension_core/Variant";
import { Constrainte } from "./../constrainte";

export class FCAConstraintsDiscovery {


  static getRequireIConstraints(variants: Variant[], blocks: Block[]): Constrainte[] {
    let allRequireConstraintes: Constrainte[] = [];
    blocks.forEach((block) => {
      let variantsOfTheBlock = variants.filter((x) => x.blocksList.includes(block));
      let intersectionResult = variantsOfTheBlock[0].blocksList;
      for (let index = 1; index < variantsOfTheBlock.length; index++) {
        let blockOfCurrentVariant = variantsOfTheBlock[index].blocksList;
        intersectionResult = intersectionResult.filter((x) =>
          blockOfCurrentVariant.includes(x)
        );
      }
      if (intersectionResult.length === 1) {
        console.log("block : " + block + " doesn't require any other block");
      } else {
        intersectionResult.forEach((element) => {
          if (block !== element) {
            console.log("block : " + block + " requires block " + element);
            allRequireConstraintes.push(new Constrainte(block.blockId, element.blockId, 1));
          }
        });
      }
    });
    return allRequireConstraintes;
  }




  static getMutualExculsionIConstraints(variants: Variant[], blocks: Block[]): Constrainte[] {
    let allMutexConstraints: Constrainte[] = [];
    blocks.forEach((block) => {
      let variantsOfTheBlock = variants.filter((x) => x.blocksList.includes(block));
      let unionResult = variantsOfTheBlock[0].blocksList;;// for init then start from 1
      for (let index = 1; index < variantsOfTheBlock.length; index++) {
        let blockOfCurrentVariant = variantsOfTheBlock[index].blocksList;
        unionResult = [...new Set([...unionResult, ...blockOfCurrentVariant])];
      }
      let differnceResult = blocks.filter(x => !unionResult.includes(x));
      if (differnceResult.length === 0) {
        console.log("block : " + block + " doesn't mutex any other block");
      } else {
        differnceResult.forEach((element) => {
          if ((block !== element)&&(block.blockId<element.blockId)) {
            console.log("block : " + block + " mutex block " + element);
            allMutexConstraints.push(new Constrainte(block.blockId, element.blockId, 2));
          }
        });
      }
    });

    return allMutexConstraints;
  }

  getMutualExculsionConstraints(
    blocksByVariant: Map<number, number[]>
  ): Constrainte[] {
    let allMutexConstraints: Constrainte[] = [];
    let variantsByBlock = this.inverseBlocksByVariant(blocksByVariant);
    let allTheBlocks = Array.from(variantsByBlock.keys());
    allTheBlocks.forEach((block) => {
      let variantsOfTheBlock = variantsByBlock.get(block)!;
      let unionResult: number[] = blocksByVariant.get(variantsOfTheBlock[0])!;// for init then start from 1
      for (let index = 1; index < variantsOfTheBlock.length; index++) {
        let blockOfCurrentVariant = blocksByVariant.get(
          variantsOfTheBlock[index]
        )!;
        unionResult = [...new Set([...unionResult, ...blockOfCurrentVariant])];
      }
      let differnceResult = allTheBlocks.filter(x => !unionResult.includes(x));
      if (differnceResult.length === 0) {
        console.log("block : " + block + " doesn't mutex any other block");
      } else {
        differnceResult.forEach((element) => {
          if (block !== element) {
            console.log("block : " + block + " mutex block " + element);
            allMutexConstraints.push(new Constrainte(block, element, 1));
          }
        });
      }
    });

    return allMutexConstraints;
  }

  // input <variant,blocks[]> output <block,variants[]>
  inverseBlocksByVariant<Type>(
    blocksByVariant: Map<Type, Type[]>
  ): Map<Type, Type[]> {
    let result = new Map<Type, Type[]>();
    let allvariants = Array.from(blocksByVariant.keys());
    allvariants.forEach((variant) => {
      let blocksArray = blocksByVariant.get(variant);
      blocksArray!.forEach((block) => {
        if (result.get(block)) {
          result.get(block)!.push(variant);
        } else {
          result.set(block, [variant]);
        }
      });
    });
    return result;
  }
}
