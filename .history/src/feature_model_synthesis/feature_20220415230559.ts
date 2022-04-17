export class Feature {

    parent: any;
    featureName: string;

    constructor(parent: any, featureName: string) {
        this.parent = parent;
        this.featureName = featureName;
    }
}