import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

import { hasGeneratingSession } from '../get-session-status';

describe('hasGeneratingSession', () => {
	it('returns true if any session has activeResponseCallback', async () => {
		const provider = {
			provideChatSessionItems: async () => [{ id: '1' }, { id: '2' }]
		};
		const contentProv = {
			provideChatSessionContent: async (id: string) => {
				if (id === '1') return { activeResponseCallback: undefined };
				if (id === '2') return { activeResponseCallback: () => { } };
			}
		};
		const token = { isCancellationRequested: false } as any;
		const result = await hasGeneratingSession(provider as any, contentProv as any, token);
		assert.strictEqual(result, true);
	});

	it('returns false if no session has activeResponseCallback', async () => {
		const provider = {
			provideChatSessionItems: async () => [{ id: '1' }]
		};
		const contentProv = {
			provideChatSessionContent: async () => ({ activeResponseCallback: undefined })
		};
		const token = { isCancellationRequested: false } as any;
		const result = await hasGeneratingSession(provider as any, contentProv as any, token);
		assert.strictEqual(result, false);
	});
});
