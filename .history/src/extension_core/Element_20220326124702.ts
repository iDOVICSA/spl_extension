import * as vscode from "vscode"
/**
 * A symbol kind.
 */
/* enum SymbolKind {
   File = 0,
   Module = 1,
   Namespace = 2,
   Package = 3,
   Class = 4,
   Method = 5,
   Property = 6,
   Field = 7,
   Constructor = 8,
   Enum = 9,
   Interface = 10,
   Function = 11,
   Variable = 12,
   Constant = 13,
   String = 14,
   Number = 15,
   Boolean = 16,
   Array = 17,
   Object = 18,
   Key = 19,
   Null = 20,
   EnumMember = 21,
   Struct = 22,
   Event = 23,
   Operator = 24,
   TypeParameter = 25
}*/
export class Element {
  instruction: string; // instruction or implimentation if element is function or method
  pathToRoot: string;  //to check ancesstors similarity
  pathToRootTypes: string; // vscode.SymbolKind enum 
  fileName: vscode.Uri; // 


  constructor(instruction: string, elementParent: string, elementParentType: string, fileName: vscode.Uri) {
    this.instruction = instruction;
    this.pathToRoot = elementParent;
    this.pathToRootTypes = elementParentType;
    this.fileName = fileName;
  }
  /**
   * Checks wether two elements are equal 
   * @param anotherElement 
   * @returns boolean value
   */
  isEqual(anotherElement: Element): Boolean {
    //first checks same parents and parentTypes
    if ((this.pathToRoot.normalize() === anotherElement.pathToRoot.normalize()) && (this.pathToRootTypes.normalize() === anotherElement.pathToRootTypes.normalize())) {

      // if element is function 11 or method 5 : delete comments then checks string value 
      if ((this.getElementKind() === 11) || (this.getElementKind() === 5)) {
        let thisCodeDeletedComments = this.instruction.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
        let otherCodeDeletedComments = anotherElement.instruction.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
        return thisCodeDeletedComments.replace(/\s+/g, '').normalize() === otherCodeDeletedComments.replace(/\s+/g, '').normalize();
      }
      // other instructions ---> check only their string value equality
      else {
        //return this.instruction.normalize() === anotherElement.instruction.normalize();

        return this.instruction.replace(/\s+/g, '').normalize() === anotherElement.instruction.replace(/\s+/g, '').normalize();
      }
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

}

