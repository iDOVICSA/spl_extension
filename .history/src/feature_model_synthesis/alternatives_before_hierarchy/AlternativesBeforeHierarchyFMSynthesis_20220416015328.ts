import { Constrainte } from "../../constraints_discovery/constrainte";
import { Block } from "../../extension_core/Block";
import { Feature } from "../feature";

export class AlternativesBeforeHierarchyFMSynthesis {

    rootName: string = "FeatureModel";
    numberOfVariants: number;
    listOfFeatures: Map<number, Feature> = new Map<number, Feature>();
    listOfBlocks: Block[];
    reqConstraints: Constrainte[];
    mutexConstraints: Constrainte[];



    constructor(blocks: Block[], reqConstraints: Constrainte[], mutexConstraints: Constrainte[], numberOfVariants: number) {
        this.listOfBlocks = blocks;
        this.reqConstraints = reqConstraints;
        this.mutexConstraints = mutexConstraints;
        this.numberOfVariants = numberOfVariants;
    }

    public createFeatureModel() {

        let root = new Feature(null, this.rootName, -1, false);
        this.listOfFeatures.set(-1, root);

        //Convert Blocks to Feature
        this.listOfBlocks.forEach(element => {
            // check if the block is mandatory 
            let f = new Feature(null, element.blockName!, element.blockId, element.blockContent.size === this.numberOfVariants);
            this.listOfFeatures.set(element.blockId, f);
        });

        //Identify alternative groups based on Mutex Constraint
        let altGroupList = new AltGroupList();
        for (let index = 0; index < this.mutexConstraints.length; index++) {
            const element = this.mutexConstraints[index];
            let feature1 = this.listOfFeatures.get(element.firstBlock);
            let feature2 = this.listOfFeatures.get(element.secondBlock);

            console.log(feature1?.featureId + "____" + feature2?.featureId);
            console.log("**");
            //check if any of feature exist in previous alternativ
            let altF1 = altGroupList.getAltGroupOfFeature(feature1!);
            let altF2 = altGroupList.getAltGroupOfFeature(feature2!);

            if (altF1 === undefined && altF2 === undefined) {
                altGroupList.addAltGroup(feature1!, feature2!);
            }
        }

        console.log(altGroupList);

    }
}


// 	 Auxiliary classes
// Alt group contain excludes element
class AltGroup {
    id: number;
    features: Feature[] = [];
    constructor(id: number) {
        this.id = id;
    }
}

class AltGroupList {

    altGroups: AltGroup[] = [];

    getAltGroupOfFeature(feature: Feature): AltGroup | undefined {
        this.altGroups.forEach(element => {
            element.features.forEach(e => {
                if (e.featureId == feature.featureId) {
                    return element;

                }
            });
            let test = element.features.find(e => e === feature);
            console.log(test);
            if (element.features.find(e => e === feature)) {
                return element;
            }
        });
        return undefined;
    }

    addAltGroup(feature1: Feature, feature2: Feature) {
        let altGroup = new AltGroup(this.altGroups.length + 1);
        altGroup.features.push(feature1);
        altGroup.features.push(feature2);


        this.altGroups.push(altGroup);
    }

}