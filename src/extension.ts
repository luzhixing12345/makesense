import * as vscode from "vscode";
import * as net from "net";
import * as path from "path";
import { MakefileParser } from "./makefile_parser";
import { MakefileWriter } from "./makefile_writer";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient;

function getClientOptions(): LanguageClientOptions {
  return {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: "file", language: "json" },
      { scheme: "untitled", language: "json" },
    ],
    outputChannelName: "[makesense] MakefileServer",
    synchronize: {
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };
}

function startLangServerTCP(addr: number): LanguageClient {
  const serverOptions: ServerOptions = () => {
    return new Promise((resolve /*, reject */) => {
      const clientSocket = new net.Socket();
      clientSocket.connect(addr, "127.0.0.1", () => {
        resolve({
          reader: clientSocket,
          writer: clientSocket,
        });
      });
    });
  };

  return new LanguageClient(
    `tcp lang server (port ${addr})`,
    serverOptions,
    getClientOptions()
  );
}

function startLangServer(
  command: string,
  args: string[],
  cwd: string
): LanguageClient {
  const serverOptions: ServerOptions = {
    args,
    command,
    options: { cwd },
  };

  return new LanguageClient(command, serverOptions, getClientOptions());
}

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
  const changeLanguage = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("language")) {
      makefileParser.reload();
    }
  });
  context.subscriptions.push(hoverProvider);
  context.subscriptions.push(changeLanguage);

  if (context.extensionMode === vscode.ExtensionMode.Development) {
    // Development - Run the server manually
    client = startLangServerTCP(2087);
  } else {
    // Production - Client is going to run the server (for use within `.vsix` package)
    const cwd = path.join(__dirname, "..", "..");
    const pythonPath = vscode.workspace
      .getConfiguration("python")
      .get<string>("pythonPath");

    if (!pythonPath) {
      throw new Error("`python.pythonPath` is not set");
    }

    client = startLangServer(pythonPath, ["-m", "server"], cwd);
  }

  context.subscriptions.push(client.start());
}

// This method is called when your extension is deactivated
export function deactivate(): Thenable<void>{
    return client ? client.stop() : Promise.resolve();
}
