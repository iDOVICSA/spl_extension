
import * as vscode from "vscode";
import { Variant } from "../extension_core/Variant";
export class Utils {

    /**
     * 
     * @param initialFolders : Opened Folders in the workspace 
     * @returns List of Variant objects 
     */
    static loadVariants(initialFolders: readonly vscode.WorkspaceFolder[]): Variant[] {
        let resullt: Variant[] = [];

        for (const folder of initialFolders) {
            let variantId = folder.uri.fsPath.split(folder.name)[0]+folder.name+"/" ;
            let variantName =folder.name;
            let variant = new Variant(variantId, variantName);
            resullt.push(variant) ;
        }

        return resullt;
    }


    static stringIsNotEmpty(s : string) : boolean {
        return  s.replace(/\s/g, "").length!==0 ;  
    }
}