import * as vscode from "vscode";
import * as path from "path";

export class MakefileWriter {
  fs = vscode.workspace.fs;
  constructor(private context: vscode.ExtensionContext) {}

  async createMakefile(url: vscode.Uri) {
    let makefilePath: string = url.path + "/" + "Makefile";
    try {
        // Makefile 文件存在
        await this.fs.stat(vscode.Uri.file(makefilePath));
        vscode.window.showErrorMessage("Makefile Existed");
    } catch {
        // Makefile 不存在
        let templatemakefilePath = this.context.asAbsolutePath(path.join('Makefiles', 'Makefile'));
        const makefileTemplate = await this.fs.readFile(vscode.Uri.file(templatemakefilePath));
        await this.fs.writeFile(vscode.Uri.file(makefilePath), Buffer.from(makefileTemplate));
    }
  }
}
