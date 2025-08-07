import * as vscode from 'vscode';
import * as path from 'path';

// 指定されたファイルパスを読み込む関数に変更
export async function readFile(filePath: string) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
        vscode.window.showErrorMessage('ワークスペースフォルダーが開かれていません');
        return;
    }
    const wsRoot = folders[0].uri.fsPath;
    const fileUri = vscode.Uri.file(path.join(wsRoot, filePath));
    let content = "";

    try {
        // テキストドキュメントとして開く
        const doc = await vscode.workspace.openTextDocument(fileUri);
        // ドキュメントの全文を取得
        content = doc.getText();
        vscode.window.showInformationMessage(`${filePath} の中身をコンソールに出力しました`);
    } catch (err) {
        vscode.window.showErrorMessage(`${filePath} の読み込みに失敗しました: ${err}`);
    }
    return content;
}

export async function writeFile(filePath: string, content: string) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
        vscode.window.showErrorMessage('ワークスペースフォルダーが開かれていません');
        return;
    }
    const wsRoot = folders[0].uri.fsPath;
    const fileUri = vscode.Uri.file(path.join(wsRoot, filePath));

    try {
        // ファイルに書き込む
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf8'));
        vscode.window.showInformationMessage(`${filePath} に内容を書き込みました`);
    } catch (err) {
        vscode.window.showErrorMessage(`${filePath} への書き込みに失敗しました: ${err}`);
    }
}

