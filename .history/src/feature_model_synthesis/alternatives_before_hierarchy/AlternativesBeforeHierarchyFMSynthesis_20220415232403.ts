import { Block } from "../../extension_core/Block";
import { Feature } from "../feature";

export class AlternativesBeforeHierarchyFMSynthesis {

    rootName: string = "FeatureModel";
    listOfFeatures: Feature[] = [];
    listOfBlocks: Block[];


    constructor(blocks: Block[]) {
        this.listOfBlocks = blocks
    }

    public createFeatureModel() {

        let root = new Feature(null, this.rootName);
        this.listOfFeatures.push(root);




    }
}