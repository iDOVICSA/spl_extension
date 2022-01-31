import { Constrainte } from "./../constrainte";

export class FCAConstraintsDiscovery {
  getRequireConstraints(blocksByVariant: Map<number, number[]>): Constrainte[] {
    let allRequireConstraintes: Constrainte[] = [];
    let variantsByBlock = this.inverseBlocksByVariant(blocksByVariant);
    let allTheBlocks = Array.from(variantsByBlock.keys());

    allTheBlocks.forEach((block) => {
      let variantsOfTheBlock = variantsByBlock.get(block)!;
      let intersectionResult: number[] = blocksByVariant.get(
        variantsOfTheBlock[0]
      )!;
      for (let index = 1; index < variantsOfTheBlock.length; index++) {
        let blockOfCurrentVariant = blocksByVariant.get(
          variantsOfTheBlock[index]
        )!;
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
            allRequireConstraintes.push(new Constrainte(block, element, 1));
          }
        });
      }
    });
    return allRequireConstraintes;
  }

  getMutualExculsionConstraints(
    blocksByVariant: Map<number, number[]>
  ): Constrainte[] {
    let allMutexConstraints: Constrainte[] = [];
    let variantsByBlock = this.inverseBlocksByVariant(blocksByVariant);
    let allTheBlocks = Array.from(variantsByBlock.keys());
    allTheBlocks.forEach((block) => {
      let variantsOfTheBlock = variantsByBlock.get(block)!;
      let unionResult: number[] = blocksByVariant.get(variantsOfTheBlock[0])!;
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
