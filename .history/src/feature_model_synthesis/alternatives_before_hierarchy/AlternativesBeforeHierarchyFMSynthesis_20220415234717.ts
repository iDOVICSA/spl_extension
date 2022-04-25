import { Constrainte } from "../../constraints_discovery/constrainte";
import { Block } from "../../extension_core/Block";
import { Feature } from "../feature";

export class AlternativesBeforeHierarchyFMSynthesis {

    rootName: string = "FeatureModel";
    numberOfVariants: number;
    listOfFeatures: Feature[] = [];
    listOfBlocks: Block[];
    reqConstraints: Constrainte[];
    mutexConstraints: Constrainte[];



    constructor(blocks: Block[], reqConstraints: Constrainte[], mutexConstraints: Constrainte[]) {
        this.listOfBlocks = blocks;
        this.reqConstraints = reqConstraints;
        this.mutexConstraints = mutexConstraints;
    }

    public createFeatureModel() {

        let root = new Feature(null, this.rootName);
        this.listOfFeatures.push(root);




    }
}