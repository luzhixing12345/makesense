/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

// import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import { SERVER_SCRIPT_PATH } from './common/constants';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
	// The server is implemented in node
	console.log(context);
	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const command = 'python';
	const args = [SERVER_SCRIPT_PATH];
	const serverOptions: ServerOptions = {
		// run: { module: serverModule, transport: TransportKind.ipc },
		// debug: {
		// 	module: serverModule,
		// 	transport: TransportKind.ipc,
		// }
		command,
		args,
		options: { cwd: workspace.workspaceFolders?.[0].uri.fsPath }
	};
	console.log(`Server run command: ${[command, ...args].join(' ')}`);

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'makefile' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export async function deactivate(): Promise<void> {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
