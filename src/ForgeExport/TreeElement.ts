import { Block } from "../extension_core/Block";
import { Element } from "../extension_core/Element";
import { ElementRange } from "../extension_core/ElementRange";

export class TreeElement {
    element : ElementRange ;
    children : TreeElement[];
    block : Block ; 
    constructor(element : ElementRange, block : Block) {
        this.element = element;
        this.block = block;
        this.children = [] ; 

      }

}