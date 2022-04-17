export class Feature {

    parent: any;
    featureName: string;
    featureId: number;
    mandatory: boolean = false;

    constructor(parent: any, featureName: string; featureId: number) {
        this.parent = parent;
        this.featureName = featureName;
    }


}