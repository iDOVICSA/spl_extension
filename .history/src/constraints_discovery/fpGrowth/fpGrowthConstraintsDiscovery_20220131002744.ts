import { Constrainte } from "./../constrainte";
import { FPGrowth, Itemset } from 'node-fpgrowth';

export class FpGrowthConstraintsDiscovery {

    adaptMapofVariantsToListToVariants() {

    }

    getRequireConstraints(blocksByVariant: Map<number, number[]>): Constrainte[] {

        const transactions: number[][] = [
            [0],
            [0, 1, 2, 4],
            [0, 1, 2, 3, 5],
            [0, 1, 3, 6],

        ];

        // Execute FPGrowth with a minimum support of 40%. Algorithm is generic.
        const fpgrowth: FPGrowth<number> = new FPGrowth<number>(.0);

        fpgrowth.on('data', (itemset: Itemset<number>) => {
            // Do something with the frequent itemset.
            const support: number = itemset.support;
            const items: number[] = itemset.items;
        });

    }

    getValideConstraine(coupleOfBlocs: Itemset<number>[] | undefined, monoBlocs: Itemset<number>[] | undefined) {
        //foreach couple we verify if firstBloc => secondBloc and if secondBloc => firstBloc
        coupleOfBlocs?.forEach(element => {

            const firstBloc = element.items[0];
            const secondBloc = element.items[1];
            const firstElement = monoBlocs?.filter(element => element.items[0] == firstBloc);
            const secondElement = monoBlocs?.filter(element => element.items[0] == secondBloc);

            let firstBlocSupport = 1;
            let secondBlocSupport = 1;

            if (firstElement) firstBlocSupport = firstElement[0].support;
            if (secondElement) secondBlocSupport = secondElement[0].support;

            if (element.support / firstBlocSupport == 1) console.log("bloc" + firstBloc + " => " + "bloc" + secondBloc);
            if (element.support / secondBlocSupport == 1) console.log("bloc" + secondBloc + " => " + "bloc" + firstBloc);

        });
    }


}