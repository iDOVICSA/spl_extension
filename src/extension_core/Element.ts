
export class Element {
    instruction : string ; // instruction or implimentation if element is function or method
    elementParent : string;  //to check ancesstors similarity
    elementParentType : string ; // vscode.SymbolKind enum
    
    constructor(instruction: string,elementParent:string,elementParentType:string) {
        this.instruction = instruction ;
        this.elementParent = elementParent ;
        this.elementParentType = elementParentType ; 
      }
}

