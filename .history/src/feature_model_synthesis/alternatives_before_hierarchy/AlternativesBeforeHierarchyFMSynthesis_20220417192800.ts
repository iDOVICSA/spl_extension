import { pbkdf2Sync } from "crypto";
import { Constrainte } from "../../constraints_discovery/constrainte";
import { Block } from "../../extension_core/Block";
import { Feature } from "../feature";
import { Utils } from "../utils";

export class AlternativesBeforeHierarchyFMSynthesis {

    rootName: string = "FeatureModel";
    numberOfVariants: number;
    listOfFeatures: Map<number, Feature> = new Map<number, Feature>();
    listOfBlocks: Block[];
    reqConstraints: Constrainte[];
    mutexConstraints: Constrainte[];



    constructor(blocks: Block[], reqConstraints: Constrainte[], mutexConstraints: Constrainte[], numberOfVariants: number) {
        this.listOfBlocks = blocks;
        this.reqConstraints = reqConstraints;
        this.mutexConstraints = mutexConstraints;
        this.numberOfVariants = numberOfVariants;
    }

    public createFeatureModel() {

        let root = new Feature(null, this.rootName, -1, false);
        this.listOfFeatures.set(-1, root);

        let eight = new Feature(null, this.rootName, 8, false);
        this.listOfFeatures.set(8, eight);
        //Convert Blocks to Feature
        this.listOfBlocks.forEach(element => {
            // check if the block is mandatory 
            let f = new Feature(null, element.blockName!, element.blockId, element.blockContent.size === this.numberOfVariants);
            this.listOfFeatures.set(element.blockId, f);
        });

        //Identify alternative groups based on Mutex Constraint
        let altGroupList = new AltGroupList();
        for (let index = 0; index < this.mutexConstraints.length; index++) {
            const element = this.mutexConstraints[index];
            let feature1 = this.listOfFeatures.get(element.firstBlock);
            let feature2 = this.listOfFeatures.get(element.secondBlock);

            //console.log(feature1?.featureId + "____" + feature2?.featureId);

            //check if any of feature exist in previous alternativ
            let altF1 = altGroupList.getAltGroupOfFeature(feature1!);
            let altF2 = altGroupList.getAltGroupOfFeature(feature2!);

            if (altF1 === undefined && altF2 === undefined) {
                altGroupList.addAltGroup(feature1!, feature2!);
            }
            // feature2 already exist in a altF2 so check for all the
            // features of this altF2 IF feature1 is also excluded
            else if (altF1 === undefined) {
                let allFound: boolean = true;
                altF2?.features.forEach(f => {
                    if (f.featureId !== feature2?.featureId) {
                        if (!Utils.existsExcludeConstraint(this.mutexConstraints, f, feature1!)) {
                            allFound = false;
                        }
                    }

                });
                if (allFound) {
                    altF2?.features.set(feature1!.featureId, feature1!);
                }
            }
            //feature 1 already in altF1
            else if (altF2 === undefined) {
                let allFound: boolean = true;
                altF1?.features.forEach(f => {
                    if (f.featureId !== feature1?.featureId) {
                        if (!Utils.existsExcludeConstraint(this.mutexConstraints, f, feature2!)) {
                            allFound = false;
                        }
                    }

                });
                if (allFound) {
                    altF1?.features.set(feature2!.featureId, feature2!);
                }
            }
        }
        // console.log(altGroupList.altGroups);

        // create alternative group for each AltGroup 
        for (let index = 0; index < altGroupList.altGroups.length; index++) {
            const element = altGroupList.altGroups[index];
            let fakeAlternative = new Feature(null, "Alternative_" + element.id, (index * -1) - 1, false);
            fakeAlternative.children = element.features;
            this.listOfFeatures.set(fakeAlternative.featureId, fakeAlternative);
            // console.log(fakeAlternative);
        }


        // Create hierarchy with the Requires
        this.listOfFeatures.forEach(f => {

            // check if the feature belongs to an alternative group
            let altGroup = altGroupList.getAltGroupOfFeature(f);
            let parentCondidate = Utils.getFeatureRequiredFeatures(this.reqConstraints, f, this.listOfFeatures);
            // we search for intersection between parentCondidate
            // and parent for all the alt group
            if (altGroup) {
                //console.log("AM FEATURE " + f.featureId + "MY GROUP IS " + altGroup.id);
                parentCondidate = Utils.getSharedParentOfAltGroup(this.reqConstraints, altGroup, parentCondidate, this.listOfFeatures);
            }

            let definitiveList = parentCondidate;

            // Reduce the parent candidates, remove ancestors (c require a ; c require b ; b require a) we remove 

            parentCondidate.forEach(pc1 => {
                parentCondidate.forEach(pc2 => {
                    if (pc1.featureId !== pc2.featureId) {
                        if (Utils.isAncestorFeature1ofFeature2(pc1, pc2, this.reqConstraints)) {
                            definitiveList.delete(pc1.featureId);
                        }
                        else if (Utils.isAncestorFeature1ofFeature2(pc2, pc1, this.reqConstraints)) {
                            definitiveList.delete(pc2.featureId);
                        }
                    }
                });
            });

            //select one parent from definitive List
            if (definitiveList.size > 0) {

                let parent: Feature | undefined;

                // greference to parents in alternative groups
                // get the first alternative group
                let definitiveParent = Array.from(definitiveList.keys());
                for (let index = 0; index < definitiveParent.length; index++) {
                    const key = definitiveParent[index];
                    if (altGroupList.getAltGroupOfFeature(definitiveList.get(key)!)) {
                        parent = definitiveList.get(key);
                        break;
                    }

                }



            }




        });

    }
}


// 	 Auxiliary classes
// Alt group contain excludes element
export class AltGroup {
    id: number;
    features: Map<number, Feature> = new Map<number, Feature>();
    constructor(id: number) {
        this.id = id;
    }
}

class AltGroupList {

    altGroups: AltGroup[] = [];

    getAltGroupOfFeature(feature: Feature): AltGroup | undefined {
        let stop = false;
        let i = 0;
        let findAltGroup = undefined;
        for (let index = 0; index < this.altGroups.length; index++) {
            const element = this.altGroups[index];
            if (element.features.get(feature.featureId)) {
                findAltGroup = element;
                break;
            }
        }
        return findAltGroup;
    }

    addAltGroup(feature1: Feature, feature2: Feature) {
        let altGroup = new AltGroup(this.altGroups.length + 1);
        altGroup.features.set(feature1.featureId, feature1);
        altGroup.features.set(feature2.featureId, feature2);


        this.altGroups.push(altGroup);
    }

}