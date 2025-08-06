
import * as vscode from 'vscode';
import { readFile } from './get-entry-file';

const BASE_PROMPT = 'answer in Japanese. ';

export function activate(context: vscode.ExtensionContext) {

	// define a chat handler
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		try {
			// entry.txtの内容を取得し
			const entryContent = await readFile("entry.txt");
			const entryLines = entryContent ? entryContent.split('\n') : [];
			for (const filePath of entryLines) {
				const prompt = BASE_PROMPT + `read and follow instructions from ${filePath.trim()}\n`;
				const fileContent = await readFile(filePath.trim());
				const messages = [
					vscode.LanguageModelChatMessage.User(fileContent ? fileContent : `Could not read ${filePath.trim()}`),
				];
				messages.push(vscode.LanguageModelChatMessage.User(request.prompt));
				const chatResponse = await request.model.sendRequest(messages, {}, token);

				// stream the response
				for await (const fragment of chatResponse.text) {
					stream.markdown(fragment);
				}
			}
		} catch (error) {
			stream.markdown('Sorry, I encountered an error while processing your request.');
			console.error('Chat handler error:', error);
		}

		return;
	};

	// create participant
	const tutor = vscode.chat.createChatParticipant("chat-tutorial.code-tutor", handler);

	// add icon to participant
	tutor.iconPath = vscode.Uri.joinPath(context.extensionUri, 'tutor.jpeg');

	// add to subscriptions for proper cleanup
	context.subscriptions.push(tutor);

	console.log('Code Tutor chat participant has been registered');
}

export function deactivate() { }