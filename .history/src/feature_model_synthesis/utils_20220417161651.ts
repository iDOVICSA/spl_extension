import { Constrainte } from "../constraints_discovery/constrainte";
import { Feature } from "./feature";

export class Utils {

    static existsExcludeConstraint(constraint: Constrainte[], f1: Feature, f2: Feature): boolean {
        let exist = false;
        for (let index = 0; index < constraint.length; index++) {
            const c = constraint[index];
            if ((c.firstBlock === f1.featureId && c.secondBlock === f2.featureId) || (c.firstBlock === f2.featureId && c.secondBlock === f1.featureId)) {
                exist = true;
                break;
            }

        }
        return exist;
    }

    // return all what feature require to exist
    static getFeatureRequiredFeatures(reqConstraint: Constrainte[], f: Feature): Feature[] | undefined {

        let requiredFeature: Feature[] = [];
        for (let index = 0; index < constraint.length; index++) {
            const c = constraint[index];
            if ((c.firstBlock === f1.featureId && c.secondBlock === f2.featureId) || (c.firstBlock === f2.featureId && c.secondBlock === f1.featureId)) {
                exist = true;
                break;
            }

        }


    }
}