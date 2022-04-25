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

        let root = new Feature(null, this.rootName, -1);
        this.listOfFeatures.push(root);

        this.listOfBlocks.forEach(element => {


        });


    }
}