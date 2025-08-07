/// <reference path="../vscode.proposed.chatSessionsProvider.d.ts" />
import * as vscode from 'vscode';

/**
 * ChatSessionItemProvider と ChatSessionContentProvider を使って、
 * 現在「生成中（activeResponseCallback が定義されている）」セッションが
 * 1つでもあるかを判定する。
 *
 * @param provider      ChatSessionItemProvider（provideChatSessionItems が使えるもの）
 * @param contentProv   ChatSessionContentProvider（provideChatSessionContent が使えるもの）
 * @param token         キャンセレーション用トークン
 * @returns             生成中セッションがあれば true
 */
export async function hasGeneratingSession(
    provider: vscode.ChatSessionItemProvider,
    contentProv: vscode.ChatSessionContentProvider,
    token: vscode.CancellationToken
): Promise<boolean> {
    // ① セッション一覧を取得（ProviderResult<ChatSessionItem[]>）
    const itemsResult = await provider.provideChatSessionItems(token);
    // ② undefined や空配列なら false
    const items = Array.isArray(itemsResult) ? itemsResult : itemsResult || [];
    if (items.length === 0) {
        return false;
    }

    // ③ 各セッションを展開して activeResponseCallback をチェック
    for (const item of items) {
        const session = await contentProv.provideChatSessionContent(item.id, token);
        // activeResponseCallback が定義されていれば「生成中」とみなす
        if (session.activeResponseCallback !== undefined) {
            return true;
        }
    }

    return false;
}
