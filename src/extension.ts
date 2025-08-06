
import * as vscode from 'vscode';
import { readFile } from './get-entry-file';

const BASE_PROMPT = 'answer in Japanese. ';

export function activate(context: vscode.ExtensionContext) {

	// define a chat handler
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		try {
			// initialize the prompt
			let prompt = BASE_PROMPT;

			// entry.txtの内容を取得し
			const entryContent = await readFile("entry.txt");
			const entryLines = entryContent ? entryContent.split('\n') : [];

			if (entryContent && entryContent.trim().length > 0) {
				prompt += `${entryContent}`;
			}

			// initialize the messages array with the prompt
			const messages = [
				vscode.LanguageModelChatMessage.User(prompt),
			];

			// get all the previous participant messages
			const previousMessages = context.history.filter(
				(h) => h instanceof vscode.ChatResponseTurn
			);

			// add the previous messages to the messages array
			previousMessages.forEach((m) => {
				let fullMessage = '';
				m.response.forEach((r) => {
					if (r instanceof vscode.ChatResponseMarkdownPart) {
						fullMessage += r.value.value;
					}
				});
				messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
			});

			// add in the user's message
			messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

			// send the request
			const chatResponse = await request.model.sendRequest(messages, {}, token);

			// stream the response
			for await (const fragment of chatResponse.text) {
				stream.markdown(fragment);
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