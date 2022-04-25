export class Feature {

    parent: any;
    featureName: string;
    mandatory: boolean = false;

    constructor(parent: any, featureName: string) {
        this.parent = parent;
        this.featureName = featureName;
    }
}