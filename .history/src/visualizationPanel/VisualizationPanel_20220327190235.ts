import * as vscode from 'vscode';
import { Constrainte } from '../constraints_discovery/constrainte';
import { Block } from '../extension_core/Block';
import { Variant } from '../extension_core/Variant';
/**
 * Manages Visualization webview panel
 */
export class VisualizationPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: VisualizationPanel | undefined;

	public static readonly viewType = 'visualizationPanel';
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	public variants: Variant[] | undefined;
	public identifiedBlocks: Block[] | undefined;
	public requireConstraintsFca: Constrainte[] | undefined;
	public exclusionConstraintsFca: Constrainte[] | undefined;
	public requireConstraintsFpGrowth: Constrainte[] | undefined;

	public static createOrShow(extensionUri: vscode.Uri, variants: Variant[], identifiedBlocks: Block[], requireConstraintsFca: Constrainte[], exclusionConstraintsFca: Constrainte[], requireConstraintsFpGrowth: Constrainte[]) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (VisualizationPanel.currentPanel) {
			VisualizationPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			VisualizationPanel.viewType,
			'Visualization',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);
		VisualizationPanel.currentPanel = new VisualizationPanel(panel, extensionUri, variants, identifiedBlocks, requireConstraintsFca, exclusionConstraintsFca, requireConstraintsFpGrowth);

	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		VisualizationPanel.currentPanel = new VisualizationPanel(panel, extensionUri, this.currentPanel?.variants, this.currentPanel?.identifiedBlocks, this.currentPanel?.requireConstraintsFca, this.currentPanel?.exclusionConstraintsFca, this.currentPanel?.requireConstraintsFpGrowth);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, variants: Variant[] | undefined, identifiedBlocks: Block[] | undefined, requireConstraintsFca: Constrainte[] | undefined, exclusionConstraintsFca: Constrainte[] | undefined, requireConstraintsFpGrowth: Constrainte[] | undefined) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.variants = variants;
		this.identifiedBlocks = identifiedBlocks;
		this.requireConstraintsFca = requireConstraintsFca;
		this.exclusionConstraintsFca = exclusionConstraintsFca;
		this.requireConstraintsFpGrowth = requireConstraintsFpGrowth;
		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showInformationMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public showVariants() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.

		if (!this.variants) { return; }
		const jsonObject: any = {};
		const jsonObjectListOfBlocks: any = {};
		const jsonObjectRerequireConstraintsFca: any = {};
		const jsonObjectExclusionConstraintsFca: any = {};
		const jsonObjectRerequireConstraintsFpGrowth: any = {};
		for (let index = 0; index < this.variants.length; index++) {
			let idBlocks = [];
			const element = this.variants[index].blocksList;
			for (let index2 = 0; index2 < element.length; index2++) {
				const bloc = element[index2];
				idBlocks.push(bloc.blockId);
			}
			jsonObject[this.variants[index].variantName] = idBlocks;
		}
		const data = JSON.stringify(jsonObject);

		for (let index = 0; index < this.identifiedBlocks!.length; index++) {
			const element = this.identifiedBlocks![index];

			jsonObjectListOfBlocks[element.blockId] = element;
		}
		const dataListOfBlocks = JSON.stringify(jsonObjectListOfBlocks);

		for (let index = 0; index < this.requireConstraintsFca!.length; index++) {
			jsonObjectRerequireConstraintsFca[index] = this.requireConstraintsFca![index];
		}
		const dataRequireConstraintsFca = JSON.stringify(jsonObjectRerequireConstraintsFca);

		for (let index = 0; index < this.exclusionConstraintsFca!.length; index++) {
			jsonObjectExclusionConstraintsFca[index] = this.exclusionConstraintsFca![index];
		}
		const dataExclusionConstraintsFca = JSON.stringify(jsonObjectExclusionConstraintsFca);

		for (let index = 0; index < this.requireConstraintsFpGrowth!.length; index++) {
			jsonObjectRerequireConstraintsFpGrowth[index] = this.requireConstraintsFpGrowth![index];
		}
		const dataRequireConstraintsFpGrowth = JSON.stringify(jsonObjectRerequireConstraintsFpGrowth);
		this._panel.webview.postMessage({
			command: 'showvariants', data: data, dataRequireConstraintsFca: dataRequireConstraintsFca, dataExclusionConstraintsFca: dataExclusionConstraintsFca, dataRequireConstraintsFpGrowth: dataRequireConstraintsFpGrowth, dataListOfBlocks: dataListOfBlocks
		});
	}

	public dispose() {
		VisualizationPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this.showVariants();

	}


	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, './src/visualizationPanel/jsFile', 'script.js');
		const scriptPathOnDisk2 = vscode.Uri.joinPath(this._extensionUri, './src/visualizationPanel/jsFile', 'anychart-base.min.js');
		const scriptPathOnDisk3 = vscode.Uri.joinPath(this._extensionUri, './src/visualizationPanel/jsFile', 'anychart-tag-cloud.min.js');
		const scriptPathOnDisk4 = vscode.Uri.joinPath(this._extensionUri, './src/visualizationPanel/jsFile', 'modalScript.js');

		// And the uri we use to load this script in the webview
		const scriptUri = (scriptPathOnDisk).with({ 'scheme': 'vscode-resource' });
		const scriptUri2 = (scriptPathOnDisk2).with({ 'scheme': 'vscode-resource' });
		const scriptUri3 = (scriptPathOnDisk3).with({ 'scheme': 'vscode-resource' });
		const scriptUri4 = (scriptPathOnDisk4).with({ 'scheme': 'vscode-resource' });

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, './src/visualizationPanel', 'main.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);

		return `<!DOCTYPE html>
		<html lang="en">
		
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${stylesResetUri}" rel="stylesheet">
			<title>Visualization</title>
		</head>
		
		<body>
		<h1>Visualization</h1>
		<div id="table">
			<div id="vardy"></div>
	
			<div class="visualiserMenu">
				<div class="titleVisualiserMenu">Visualiser Menu</div>
				<div id="blocMenu">
					<p id="variatnsTitle">variants</p>
	
	
				</div>
			</div>
	
		</div>
	
		<!-- Modal -->
		<div id="myModal" class="modal">
	
			<div class="modal-content">
	
				<div class="modal-header">
					<button type="button" class="closeBtn close"></button>
					<h2>Block Description</h2>
				</div>
	
				<div class="modal-body">
					<label>Block Name</label>
					<input list="browsers" type="text" id="blockName" placeholder="Enter bloc name">
						
					</input>
					<label>Or you can choose as block name </label>
					<select id="options">
                    </select>

					<h2>Word Cloud</h2>
					<div class="center">
						<div id="container"></div>
					</div>
				</div>
	
				<div class="modal-footer">
					<button class="bet_time closeButton close" id="closeButton">Close</button>
					<button class="bet_time saveChangesButton" onclick="saveChangesButton()">Save changes</button>
	
				</div>
	
			</div>
		</div>

		<h1>Constraint</h1>

		<div id="table2"> 
		<div id="fca" class="constraint">
		<div class="titleConstraint">FCA Constraints Discovery</div>
		</div>
		<div id="fpGrowth" class="constraint">
		<div class="titleConstraint">FpGrowth Constraints Discovery</div>
		</div>		
		
			</div>
		<div id="rerequireParagraph"></div>
		</body>
		<script type="text/javascript" src="${scriptUri}"></script>
		<script type="text/javascript" src="${scriptUri4}"></script>
		<script type="text/javascript" src="${scriptUri2}"></script>
		<script type="text/javascript" src="${scriptUri3}"></script>

		</html>`;
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's media directory.
		//localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}