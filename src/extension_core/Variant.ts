/**
 * Represents a variant
 * @attribute variantName : Initial folder name 
 * @attribute variantId : Path from root to Initial folder name
 * @attribute blocksList : List of blocks contained in this variant
 * @public
 */

import { Block } from "./Block";

export class Variant {
    variantName : string ;
    variantId : string;
    blocksList : Block[]=[] ;

    constructor (variantId : string , variantName: string){
        this.variantId = variantId ; 
        this.variantName = variantName ; 
    }

}