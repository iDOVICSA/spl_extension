import * as vscode from 'vscode';
import { ElementRange } from './ElementRange';

export class Element {
  instruction: string; // instruction or implimentation if element is function or method
  pathToRoot: string;  //to check ancesstors similarity
  pathToRootTypes: string; // vscode.SymbolKind enum 
  fileName: vscode.Uri; //
  parent?: ElementRange;


  constructor(instruction: string, pathToRoot: string, pathToRootTypes: string, fileName: vscode.Uri, parent: ElementRange | undefined) {
    this.instruction = instruction;
    this.pathToRoot = pathToRoot;
    this.pathToRootTypes = pathToRootTypes;
    this.fileName = fileName;
    this.parent = parent;
  }
  /**
   * Checks wether two elements are equal 
   * @param anotherElement 
   * @returns boolean value
   */
   
  isEqual(anotherElement: Element , divideFunc:boolean): Boolean {
    //first checks same parents and parentTypes
    if ((this.pathToRoot.normalize() === anotherElement.pathToRoot.normalize()) && (this.pathToRootTypes.normalize() === anotherElement.pathToRootTypes.normalize())) {

      // if element is function 11 or method 5 : delete comments then checks string value 
      if (divideFunc) {
        return this.instruction.replace(/\s+/g, '').normalize() === anotherElement.instruction.replace(/\s+/g, '').normalize();

      }
      else {
        if ((this.getElementKind() === 11) || (this.getElementKind() === 5)) {
          let thisCodeDeletedComments = this.instruction.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
          let otherCodeDeletedComments = anotherElement.instruction.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
          return thisCodeDeletedComments.replace(/\s+/g, '').normalize() === otherCodeDeletedComments.replace(/\s+/g, '').normalize();
        }
        // other instructions ---> check only their string value equality
        else {

          return this.instruction.replace(/\s+/g, '').normalize() === anotherElement.instruction.replace(/\s+/g, '').normalize();
        }
      }


    }
    else {
      return false;
    }
  }


  isEqualAllDivided(anotherElement: Element): Boolean {
    //first checks same parents and parentTypes
    if ((this.pathToRoot.normalize() === anotherElement.pathToRoot.normalize()) && (this.pathToRootTypes.normalize() === anotherElement.pathToRootTypes.normalize())) {
      return this.instruction.replace(/\s+/g, '').normalize() === anotherElement.instruction.replace(/\s+/g, '').normalize();

    }
    else {
      return false;
    }

    /*   return this.instruction.replace(/\s+/g,'').normalize() === anotherElement.instruction.replace(/\s+/g,'').normalize() 
       && this.pathToRoot.normalize() === anotherElement.pathToRoot.normalize()
       && this.pathToRootTypes.normalize() === anotherElement.pathToRootTypes.normalize() ;*/
  }


  /**
   * 
   * @param anotherElement 
   * @returns 
   */
  isEqualWithSpace(anotherElement: Element): Boolean {
    return this.instruction.normalize() === anotherElement.instruction.normalize()
      && this.pathToRoot.normalize() === anotherElement.pathToRoot.normalize()
      && this.pathToRootTypes.normalize() === anotherElement.pathToRootTypes.normalize();
  }
  getElementKind(): number {
    return parseInt(this.pathToRootTypes.split(".").pop()!);
  }

  getElementParentInstruction(): string {
    if (this.pathToRoot === "root") { return "root"; } else {
      return this.pathToRoot.split("@@").pop()!;
    }

  }


}

