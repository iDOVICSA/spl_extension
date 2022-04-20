import { Constrainte } from "../../constraints_discovery/constrainte";
import { Block } from "../../extension_core/Block";
import { Feature } from "../feature";
import { Utils } from "../utils";

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

        //Convert Blocks to Feature
        this.listOfBlocks.forEach(element => {
            // check if the block is mandatory 
            let f = new Feature(null, element.blockName!, element.blockId, element.blockContent.size === this.numberOfVariants);
            f.parent = root;
            root.children.set(f.featureId, f);
            this.listOfFeatures.set(element.blockId, f);
        });
        let fmJson: string = Utils.exportAlternativesBeforeHierarchyFMForgeJson(this.listOfFeatures, this.reqConstraints, this.mutexConstraints);
        console.log(fmJson);
        return fmJson;
    }
}
