import * as vscode from "vscode";
import { IgnoredFolders } from "../Utils/IgnoredFolders";
import * as path from "path";
import { Utils } from "../Utils/Utilis";
export class FoldersAdapter {

    async adaptFolders(foldersVariants: readonly vscode.WorkspaceFolder[], uris: any, excludeFilter: string[]: undefined): Promise<Map<string, string[]>> {
        // Map<fileRelativeURL,listOf BaseUrl of Variants it appears on>
        let filesVariantsMap = new Map<string, string[]>();

        for (const folder of foldersVariants) {
            if (Utils.ifSelected(folder.uri, uris)) {

                let indexVariant = folder.uri.fsPath.split(folder.name)[0] + folder.name + path.sep;

                let result: string[] = [];
                await this.browseFolders(folder.uri, ".", result);
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    if (filesVariantsMap.get(element)) {
                        filesVariantsMap.get(element)?.push(indexVariant);
                    }
                    else {
                        if (Utils.ifExclude(element,)) {

                        }
                        filesVariantsMap.set(element, [indexVariant]);
                    }
                }
            }
        }
        return filesVariantsMap;
    }

    /**
        *Browse Folders structure to get files with their relational url to root
        *@param folder : folder url --- 
        *@param relativePathToInitialFolder : path to variant initial root  folder './' 
        *@param result : recursive function so we pass result as an argument, it contains all the files 
        *contained in the variant each string result represent the pathToinitalFolder/fileName 

        returns result : string [] : list of relativePathToInitialFolder of all files contained in the variant folder
    */
    async browseFolders(folder: vscode.Uri, relativePathToInitialFolder: string, result: string[]) {

        let dir = await vscode.workspace.fs.readDirectory(folder);

        for (const v of dir) {
            let filePath = vscode.Uri.joinPath(folder, v[0]);

            // if fileType = file
            if (v[1] === 1) {
                result.push(relativePathToInitialFolder + path.sep + v[0]);
            }

            //if fileType == Folder
            // second condition ignores hidden folders 
            if ((v[1] === 2) && (v[0].split(".")[0]) && !(v[0] in IgnoredFolders)) {

                await this.browseFolders(filePath, relativePathToInitialFolder + path.sep + v[0], result);
            }
        }
    }
}   
