import * as vscode from 'vscode';
import { readFile } from './get-entry-file';
import { hasGeneratingSession } from './get-session-status';

export function activate(context: vscode.ExtensionContext) {

	// 1) コマンド登録
	const disposable = vscode.commands.registerCommand('myExtension.sendToCopilot', async () => {
		// entry.txtの内容を取得し
		const entryContent = await readFile("entry.txt");
		const entryLines = entryContent ? entryContent.split('\n') : [];
		for (const filePath of entryLines) {
			const fileContent = await readFile(filePath.trim());
			// Copilot Chat を開きつつ、prompt を送信
			await vscode.commands.executeCommand('workbench.action.chat.open', fileContent);

			// 5秒ごとにAIの回答が終わったか判定
			const provider = vscode.chat.createChatSessionItemProvider?.('github');
			const contentProv = vscode.chat.createChatSessionContentProvider?.('github');
			const tokenSource = new vscode.CancellationTokenSource();
			if (provider && contentProv) {
				while (true) {
					const generating = await hasGeneratingSession(provider, contentProv, tokenSource.token);
					if (!generating) break;
					await new Promise(resolve => setTimeout(resolve, 5000));
				}
			} else {
				// fallback: 5秒待つ
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}
	});
	context.subscriptions.push(disposable);

	// 2) ステータスバーにボタンを作成
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = 'Copilot に送信';
	statusBarItem.tooltip = 'あらかじめ定義したプロンプトを Copilot Chat に送信します';
	statusBarItem.command = 'myExtension.sendToCopilot';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);
}

export function deactivate() { }