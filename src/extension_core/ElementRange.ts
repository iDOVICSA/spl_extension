import { Element } from "./Element";
import * as vscode from "vscode";
export class ElementRange {
    element : Element ;
    elementRange : vscode.Range  ; 

    constructor (element : Element , elementRange : vscode.Range  ) {
        this.element = element ;
        this.elementRange = elementRange;
    }




    getDistanceToParent() : number {
        try {
            if (this.getParent()==="root") {
                return this.elementRange.start.line;
            }
            else {
                if (this.element.symbol) {
                  return  this.elementRange.start.line - this.element.parent?.element.parent?.elementRange.start.line! ; 
                }
                else {
                  return  this.elementRange.start.line - this.element.parent?.elementRange.start.line! ; 
                }
            }
        }
        catch (err) {
            debugger ; 
            console.log("from getDistanceToParent() "+err) ;
            return 0 ; 
        }
       
    }

    getParent () : string {
        if (!this.element.symbol) {
            return this.element.getElementParentInstruction();
        }
        else {
            let m = this.element.pathToRoot.split("@@") ;
            m.pop();
            return m.join("@@") ;
        }
    }

    getParentPathRoot() : string {
       // if (this.elementRange.start.line===this.elementRange.end.line) {
        if (!this.element.symbol) {    
          return this.element.pathToRoot ; 
        }
        else {
            let m = this.element.pathToRoot.split("@@") ;
            m.pop();
            return m.join("@@") ;
        }
    }
}