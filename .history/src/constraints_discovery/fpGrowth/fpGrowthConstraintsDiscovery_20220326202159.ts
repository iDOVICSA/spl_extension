import { Constrainte } from "./../constrainte";
import { FPGrowth, Itemset } from 'node-fpgrowth';
import { Block } from "../../extension_core/Block";
import { Variant } from "../../extension_core/Variant";

export class FpGrowthConstraintsDiscovery {

    static async getRequireConstraints(variants: Variant[], blocks: Block[]): Promise<Constrainte[]> {
        let allRequireConstraintes: Constrainte[] = [];
        blocks.forEach((block) => {
            let variantsOfTheBlock = variants.filter((x) => x.blocksList.includes(block));
        });
        const transactions = Array.from(blocksByVariant.values());
        // Execute FPGrowth with a minimum support of 40%. Algorithm is generic.
        const fpgrowth: FPGrowth<number> = new FPGrowth<number>(.0);

        fpgrowth.on('data', (itemset: Itemset<number>) => {
            // Do something with the frequent itemset.
            const support: number = itemset.support;
            const items: number[] = itemset.items;
        });
        let coupleOfBlocs: Itemset<number>[] | undefined = undefined;
        let monoBlocs: Itemset<number>[] | undefined = undefined;

        // Execute FPGrowth on a given set of transactions.
        await fpgrowth.exec(transactions)
            .then((itemsets: Itemset<number>[]) => {
                // Returns an array representing the frequent itemsets.
                coupleOfBlocs = itemsets.filter(element => element.items.length === 2);
                monoBlocs = itemsets.filter(element => element.items.length === 1);
                allRequireConstraintes = this.getValideConstraine(coupleOfBlocs, monoBlocs);
            });
        return allRequireConstraintes;

    }

    static getValideConstraine(coupleOfBlocs: Itemset<number>[] | undefined, monoBlocs: Itemset<number>[] | undefined): Constrainte[] {
        let allRequireConstraintes: Constrainte[] = [];

        //foreach couple we verify if firstBloc => secondBloc and if secondBloc => firstBloc
        coupleOfBlocs?.forEach(element => {

            const firstBloc = element.items[0];
            const secondBloc = element.items[1];
            const firstElement = monoBlocs?.filter(element => element.items[0] === firstBloc);
            const secondElement = monoBlocs?.filter(element => element.items[0] === secondBloc);

            let firstBlocSupport = 1;
            let secondBlocSupport = 1;

            firstElement![0].support;
            secondBlocSupport = secondElement![0].support;
            if ((element.support / firstBlocSupport) === 1) {
                // console.log("bloc" + firstBloc + " => " + "bloc" + secondBloc);
                allRequireConstraintes.push(new Constrainte(firstBloc, secondBloc, 1));
            }
            if (element.support / secondBlocSupport === 1) {
                // console.log("bloc" + secondBloc + " => " + "bloc" + firstBloc);
                allRequireConstraintes.push(new Constrainte(secondBloc, firstBloc, 1));
            }

        });
        return allRequireConstraintes;
    }


}