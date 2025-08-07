import * as vscode from 'vscode';
import { readFile, writeFile } from './handle-file';

export function activate(context: vscode.ExtensionContext) {

	// finish.txtに文字が書き込まれるまで待機するPromise関数
	async function waitForFinishTxt() {
		return new Promise<void>((resolve) => {
			const interval = setInterval(async () => {
				try {
					const finishLines = await readFile('finish.txt');
					if (finishLines && finishLines.length > 0) {
						vscode.window.showInformationMessage('finish.txt に文字が書き込まれました: ');
						// finish.txtの中身を空にする
						await writeFile('finish.txt', "");
						clearInterval(interval);
						resolve();
					}
				} catch (e) {
					// ファイルがない場合などは無視
				}
			}, 5000);
			// intervalのクリーンアップ
			context.subscriptions.push({ dispose: () => clearInterval(interval) });
		});
	}

	//10秒まつ関数
	async function waitForSeconds(seconds: number) {
		return new Promise(resolve => setTimeout(resolve, seconds * 1000));
	}

	// 1) コマンド登録
	const disposable = vscode.commands.registerCommand('myExtension.sendToCopilot', async () => {
		const entryContent = await readFile('entry.txt');
		const BASE_PROMPT = await readFile('base_prompt.txt');
		if (!entryContent) {
			vscode.window.showErrorMessage('entry.txt が見つかりません。');
			return;
		}
		const entryLines = entryContent.split('\n').filter(line => line.trim() !== '');
		// finish.txtを空にする
		await writeFile('finish.txt', "");
		for (const line of entryLines) {
			const prompt = `${BASE_PROMPT}\n
			 read and follow instructions in 
			 ${line.trim()}`;
			// Copilot Chat を開きつつ、prompt を送信
			await vscode.commands.executeCommand('workbench.action.chat.open', prompt);

			// finish.txtに文字が書き込まれるまで待機
			await waitForFinishTxt();
			// 10秒待機
			await waitForSeconds(10);
		}
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