
import * as vscode from 'vscode';
import { readFile } from './get-entry-file';
import * as chatUtils from '@vscode/chat-extension-utils';

const BASE_PROMPT = 'answer in Japanese. ';

export function activate(context: vscode.ExtensionContext) {

	// define a chat handler
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		try {
			// entry.txtの内容を取得し
			const entryContent = await readFile("entry.txt");
			const entryLines = entryContent ? entryContent.split('\n') : [];
			const tools = vscode.lm.tools;
			for (const filePath of entryLines) {
				const prompt = BASE_PROMPT + `read and follow instructions from ${filePath.trim()}\n`;
				const fileContent = await readFile(filePath.trim());
				const messages = [
					vscode.LanguageModelChatMessage.User(fileContent ? fileContent : `Could not read ${filePath.trim()}`),
				];
				messages.push(vscode.LanguageModelChatMessage.User(request.prompt));
				const chatResponse = chatUtils.sendChatParticipantRequest(
					request,
					context,
					{
						prompt: prompt,
						responseStreamOptions: {
							stream,
							references: true,
							responseText: true
						},
						tools
					},
					token
				);
				await chatResponse.result;
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