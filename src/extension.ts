import * as vscode from "vscode";
import { MakefileParser } from "./makefile_parser";
import { MakefileWriter } from "./makefile_writer";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "makesense" is now active!');

  let makefileCreation = vscode.commands.registerCommand(
    "makesense.createMakefile",
    (url) => {
      const writer = new MakefileWriter(context);
      writer.createMakefile(url);
    }
  );

  context.subscriptions.push(makefileCreation);
  const makefileParser = new MakefileParser(context);
  const hoverProvider = vscode.languages.registerHoverProvider(
    { scheme: "file", language: "makefile" }, // 你的文件 URI scheme
    {
      provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
      ) {
        return makefileParser.provideHover(document, position, token);
      },
    }
  );
  const changeLanguage = vscode.workspace.onDidChangeConfiguration((event)=> {
    if (event.affectsConfiguration("language")) {
        makefileParser.reload();
    }
  });
  context.subscriptions.push(hoverProvider);
  context.subscriptions.push(changeLanguage);
}

// This method is called when your extension is deactivated
export function deactivate() {}
