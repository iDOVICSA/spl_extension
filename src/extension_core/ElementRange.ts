import { Element } from "./Element";
import * as vscode from "vscode";
export class ElementRange {
    element : Element ;
    elementRange : vscode.Range  ; 
    constructor (element : Element , elementRange : vscode.Range) {
        this.element = element ;
        this.elementRange = elementRange;
    }
}