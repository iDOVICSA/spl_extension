import { Feature } from "../feature";

export class AlternativesBeforeHierarchyFMSynthesis {

    rootName: string = "FeatureModel";
    listOfFeatures: Feature[] = [];

    public createFeatureModel() {

        let root = new Feature(null, this.rootName);
        this.listOfFeatures.push(root);




    }
}