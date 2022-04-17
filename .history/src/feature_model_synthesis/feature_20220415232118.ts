export class Feature {

    parent: any;
    featureName: string;
    mandatory: Boolean;

    constructor(parent: any, featureName: string) {
        this.parent = parent;
        this.featureName = featureName;
    }
}