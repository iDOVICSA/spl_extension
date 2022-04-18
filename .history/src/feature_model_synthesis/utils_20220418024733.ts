import { features } from "process";
import { Constrainte } from "../constraints_discovery/constrainte";
import { AltGroup } from "./alternatives_before_hierarchy/AlternativesBeforeHierarchyFMSynthesis";
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
    static getFeatureRequiredFeatures(reqConstraint: Constrainte[], f: Feature, listOfFeature: Map<number, Feature>): Map<number, Feature> {
        //console.log("**************");
        //console.log(f.featureId);
        let requiredFeatures: Map<number, Feature> = new Map<number, Feature>();
        for (let index = 0; index < reqConstraint.length; index++) {
            const c = reqConstraint[index];
            if (c.firstBlock === f.featureId) {
                let requiredFeature: Feature = listOfFeature.get(c.secondBlock)!;
                if (requiredFeature.mandatory === false) {
                    requiredFeatures.set(requiredFeature!.featureId, requiredFeature!);
                }
            }

        }
        return requiredFeatures;
    }

    static getSharedParentOfAltGroup(reqConstraint: Constrainte[], altGroup: AltGroup, parentCondidate: Map<number, Feature>, listOfFeature: Map<number, Feature>) {
        let sharedParent = parentCondidate;


        altGroup.features.forEach(fea => {
            let parentsOfFea = this.getFeatureRequiredFeatures(reqConstraint, fea, listOfFeature);
            parentCondidate.forEach(condidate => {
                if (!parentsOfFea.has(condidate.featureId)) {
                    sharedParent.delete(condidate.featureId);
                }
            });

        });

        return sharedParent;

    }

    static isAncestorFeature1ofFeature2(f1: Feature, f2: Feature, reqConstraint: Constrainte[]): Boolean {
        let exist = false;
        for (let index = 0; index < reqConstraint.length; index++) {
            const c = reqConstraint[index];
            if (f2.featureId === c.firstBlock) {
                exist = true;
                break;
            }

        }
        return exist;
    }

    static getNumberOfExistenceOf(f: Feature, reqConstraint: Constrainte[]): number {
        let cpt = 0;
        for (let index = 0; index < reqConstraint.length; index++) {
            const c = reqConstraint[index];
            if (c.secondBlock === f.featureId) {
                cpt++;
            }
        }
        return cpt;
    }

    static deleteRedundantReqConstraint(reqConstraint: Constrainte[], listOfFeature: Map<number, Feature>) {
        let redundantReqConstraint: Constrainte[] = [];
        for (let index = 0; index < reqConstraint.length; index++) {
            const c = reqConstraint[index];
            let f = listOfFeature.get(c.firstBlock);
            let stop = false;
            while (!stop && f) {
                if (f?.parent?.featureId === c.secondBlock) {
                    stop = true;
                }
                f = f?.parent;
            }
            if (stop) {

            }

        }
    }
}