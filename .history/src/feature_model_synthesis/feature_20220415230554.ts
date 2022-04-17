export class Feature {

    parent: any;
    featureName: string;

    constructor(parent: string, featureName: string) {
        this.parent = parent;
        this.featureName = featureName;
    }
}