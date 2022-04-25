import { Element } from "./Element";
import * as vscode from "vscode";
export class ElementRange {
    element : Element ;
    elementRange : vscode.Range  ; 
    constructor (element : Element , elementRange : vscode.Range) {
        this.element = element ;
        this.elementRange = elementRange;
    }




    getParent () : string {
        if (this.elementRange.start.line===this.elementRange.end.line) {
            return this.element.getElementParentInstruction();
        }
        else {
            let m = this.element.pathToRoot.split("@@") ;
            m.pop();
            return m.join("@@") ;
        }
    }

    getParentPathRoot() : string {
        if (this.elementRange.start.line===this.elementRange.end.line) {
            return this.element.pathToRoot ; 
        }
        else {
            let m = this.element.pathToRoot.split("@@") ;
            m.pop();
            return m.join("@@") ;
        }
    }
}