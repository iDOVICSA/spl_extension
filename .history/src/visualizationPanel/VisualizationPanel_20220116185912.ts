
import * as vscode from 'vscode';
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
	public blocksByVariant: Map<number, number[]> | undefined;
	public static createOrShow(extensionUri: vscode.Uri) {
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

		VisualizationPanel.currentPanel = new VisualizationPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		VisualizationPanel.currentPanel = new VisualizationPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

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
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public showVariants(blocksByVariant: Map<number, number[]> | undefined) {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		if (!blocksByVariant) { return; }
		this.blocksByVariant = blocksByVariant;
		const jsonObject: any = {};
		blocksByVariant.forEach((value, key) => {
			jsonObject[key] = value;
		});
		const data = JSON.stringify(jsonObject);
		this._panel.webview.postMessage({
			command: 'showvariants', data: data
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
		this.showVariants(this.blocksByVariant);
	}

	private _updateForVisualizationPanel(webview: vscode.Webview, catName: keyof typeof cats) {
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, './src/visualizationPanel', 'script.js');

		// And the uri we use to load this script in the webview
		const scriptUri = (scriptPathOnDisk).with({ 'scheme': 'vscode-resource' });

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
			<div id="table">
			</div>
		</body>
		<script type="text/javascript" src="${scriptUri}"></script>
		
		</html>`;
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		//localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}
