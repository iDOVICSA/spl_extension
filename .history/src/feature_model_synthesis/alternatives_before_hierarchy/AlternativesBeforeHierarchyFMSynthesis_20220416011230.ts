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

        for (let index = 0; index < this.mutexConstraints.length; index++) {
            const element = this.mutexConstraints[index];
            let feature1 = this.listOfFeatures.get(element.firstBlock);
            let feature2 = this.listOfFeatures.get(element.secondBlock);



        }

    }
}


// 	 Auxiliary classes
// Alt group contain excludes element
class AltGroup {
    id: number;
    altGroup: Feature;
    features: Feature[] = [];
    constructor(id: number) {
        this.id = id;
        this.altGroup = undefined;
    }
}

class AltGroupList {

    altGroups: AltGroup[] = [];

    addAltGroup(features: Feature[]) {
        let altGroup = new AltGroup(this.altGroups.length + 1);
        features.forEach(element => {
            altGroup.features.push(element);
        });

        this.altGroups.push(altGroup);
    }

}