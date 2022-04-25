export class Feature {

    parent: Feature | undefined;
    featureName: string;
    featureId: number;
    mandatory: boolean;
    children: Map<number, Feature> = new Map<number, Feature>();
    isFake: boolean = false;
    colorOfFeature: string;

    constructor(parent: any, featureName: string, featureId: number, mandatory: boolean, color: string) {
        this.parent = parent;
        this.featureName = featureName;
        this.featureId = featureId;
        this.mandatory = mandatory;
        this.colorOfFeature = color;
    }


}