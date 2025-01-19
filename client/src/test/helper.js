"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocUri = exports.getDocPath = exports.platformEol = exports.documentEol = exports.editor = exports.doc = void 0;
exports.activate = activate;
exports.setTestContent = setTestContent;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Activates the vscode.lsp-sample extension
 */
async function activate(docUri) {
    // The extensionId is `publisher.name` from package.json
    const ext = vscode.extensions.getExtension('vscode-samples.lsp-sample');
    await ext.activate();
    try {
        exports.doc = await vscode.workspace.openTextDocument(docUri);
        exports.editor = await vscode.window.showTextDocument(exports.doc);
        await sleep(2000); // Wait for server activation
    }
    catch (e) {
        console.error(e);
    }
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const getDocPath = (p) => {
    return path.resolve(__dirname, '../../testFixture', p);
};
exports.getDocPath = getDocPath;
const getDocUri = (p) => {
    return vscode.Uri.file((0, exports.getDocPath)(p));
};
exports.getDocUri = getDocUri;
async function setTestContent(content) {
    const all = new vscode.Range(exports.doc.positionAt(0), exports.doc.positionAt(exports.doc.getText().length));
    return exports.editor.edit(eb => eb.replace(all, content));
}
//# sourceMappingURL=helper.js.map