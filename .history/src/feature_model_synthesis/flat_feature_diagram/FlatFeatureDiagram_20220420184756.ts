import { Constrainte } from "../../constraints_discovery/constrainte";
import { Block } from "../../extension_core/Block";
import { Feature } from "../feature";

export class FlatFeatureDiagram {

    rootName: string = "FeatureModel";
    numberOfVariants: number;
    listOfFeatures: Map<number, Feature> = new Map<number, Feature>();
    listOfBlocks: Block[];
    reqConstraints: Constrainte[];


    constructor(blocks: Block[], reqConstraints: Constrainte[], mutexConstraints: Constrainte[], numberOfVariants: number) {
        this.listOfBlocks = blocks;
        this.reqConstraints = reqConstraints;
        this.numberOfVariants = numberOfVariants;
    }

    public createFeatureModel() {
        let root = new Feature(null, this.rootName, -2, false);
        this.listOfFeatures.set(-1, root);
    }
}
