
import * as vscode from 'vscode';
import {Parser} from './makefile_parser';
import { MakefileWriter } from './makefile_writer';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "makesense" is now active!');

    let x = vscode.commands.registerCommand('makesense.createMakefile', (url) => {
		const writer = new MakefileWriter(context);
		writer.createMakefile(url);
	});

    context.subscriptions.push(x);
}

// This method is called when your extension is deactivated
export function deactivate() {}
