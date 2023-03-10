import * as vscode from "vscode";


export class MakefileParser {

  makefileSnippets: Record<string, string> = {};
  makefileSnippetPath: string;
  fs = vscode.workspace.fs;
  constructor(private context: vscode.ExtensionContext) {
    this.makefileSnippetPath = this.context.asAbsolutePath('makefile_snippets.json');
    this.registerMakefileSnippets(this.makefileSnippetPath);
  }

  reload() {
    // reload to register makefile snippets after user changed language
    this.registerMakefileSnippets(this.makefileSnippetPath);
  }

  async registerMakefileSnippets(path: string) {
    let makefileSnippetFile = await this.fs.readFile(vscode.Uri.file(path)) as Buffer;
    let makefileSnippetsJson = JSON.parse(makefileSnippetFile.toString());
    const config = vscode.workspace.getConfiguration();
    let language = config.get<string>('language');
    if (language === undefined) {
        language = 'en';
    }
    for (let name in makefileSnippetsJson) {
        if (name[0] === '$') {
            continue;
        }
        this.makefileSnippets[name] = makefileSnippetsJson[name].description[language];
    }
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position);
    const functionName = document.getText(range);
    console.log("catch ",functionName);
    const functionDoc = this.getFunctionDoc(functionName);
    if (functionDoc) {
      return new vscode.Hover(functionDoc);
    }
  }

  getFunctionDoc(functionName: string): string | undefined {
    // console.log(this.makefileSnippets[functionName],".");
    return this.makefileSnippets[functionName];
  }
};
