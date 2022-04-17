export class Feature {

    parent: any;
    featureName: string;
    featureId: number;
    mandatory: boolean;

    constructor(parent: any, featureName: string, featureId: number, mandatory: boolean) {
        this.parent = parent;
        this.featureName = featureName;
        this.featureId = featureId;
        this.mandatory = mandatory;
    }


}