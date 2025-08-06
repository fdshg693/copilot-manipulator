import * as vscode from 'vscode';
import { readFile } from './get-entry-file';

export function activate(context: vscode.ExtensionContext) {

	// 1) コマンド登録
	const disposable = vscode.commands.registerCommand('myExtension.sendToCopilot', async () => {
		// ここに送信したいメッセージを記述
		const prompt = '1+1';
		// Copilot Chat を開きつつ、prompt を送信
		await vscode.commands.executeCommand('workbench.action.chat.open', prompt);
	});
	context.subscriptions.push(disposable);

	// 2) ステータスバーにボタンを作成
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = '$(comment-discussion) Copilot に送信';
	statusBarItem.tooltip = 'あらかじめ定義したプロンプトを Copilot Chat に送信します';
	statusBarItem.command = 'myExtension.sendToCopilot';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);
}

export function deactivate() { }