    /**
     * A symbol kind.
     */
   /*  export enum SymbolKind {
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
    instruction : string ; // instruction or implimentation if element is function or method
    pathToRoot : string;  //to check ancesstors similarity
    pathToRootTypes : string ; // vscode.SymbolKind enum 
    fileName : string ; // 
    

    constructor(instruction: string,elementParent:string,elementParentType:string,fileName : string) {
        this.instruction = instruction ;
        this.pathToRoot = elementParent ;
        this.pathToRootTypes = elementParentType ; 
        this.fileName = fileName ; 
      }

      isEqual(anotherElement: Element): Boolean {
        return this.instruction.replace(/\s+/g,'').normalize() === anotherElement.instruction.replace(/\s+/g,'').normalize() 
        && this.pathToRoot.normalize() === anotherElement.pathToRoot.normalize()
        && this.pathToRootTypes.normalize() === anotherElement.pathToRootTypes.normalize() ;
    }
    
}

