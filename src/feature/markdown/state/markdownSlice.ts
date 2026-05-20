import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type MarkdownDocumentIndexItem } from '../logic/documentIndex';

export type { MarkdownDocumentIndexItem };

/** Markdown 表示・編集モード。 */
export type MarkdownViewMode =
	/** レンダリング済み HTML を表示するプレビューモード。 */
	| 'preview'
	/** ソーステキストを直接編集する編集モード。 */
	| 'edit';

/** 読み込み/保存ステータス。 */
export type MarkdownRequestStatus =
	/** 初期状態。読み込みも保存も行っていない。 */
	| 'idle'
	/** ドキュメントを取得中。 */
	| 'loading'
	/** ドキュメントの取得が完了した状態。 */
	| 'loaded'
	/** ドキュメントを保存中。 */
	| 'saving'
	/** 取得または保存でエラーが発生した状態。 */
	| 'error';

/**
 * Markdown feature の状態。
 */
export type MarkdownState = {
	/** `id` をキーにしたドキュメント索引。 */
	documentIndexById: Record<string, MarkdownDocumentIndexItem>;
	/** 現在選択中ドキュメント id。 */
	activeDocumentId: string;
	/** 現在選択中ドキュメントの path。 */
	activeDocumentPath: string;
	/** 現在選択中ドキュメントの title。 */
	activeDocumentTitle: string;
	/** 読み込んだ元テキスト。 */
	sourceContent: string;
	/** 編集中テキスト。 */
	draftContent: string;
	/** 現在テキストの sha。 */
	activeSha: string;
	/** 読み込み・保存のステータス。 */
	status: MarkdownRequestStatus;
	/** 最新のエラーメッセージ。 */
	errorMessage: string;
	/** preview / edit の UI モード。 */
	viewMode: MarkdownViewMode;
};

const initialState: MarkdownState = {
	documentIndexById: {},
	activeDocumentId: '',
	activeDocumentPath: '',
	activeDocumentTitle: '',
	sourceContent: '',
	draftContent: '',
	activeSha: '',
	status: 'idle',
	errorMessage: '',
	viewMode: 'preview',
};

const markdownSlice = createSlice({
	name: 'markdown',
	initialState,
	reducers: {
		/**
		 * `menu.yaml` 由来の索引を全置換する。
		 * @param action.payload 索引配列
		 */
		documentIndexLoaded: (
			state,
			action: PayloadAction<MarkdownDocumentIndexItem[]>,
		) => {
			state.documentIndexById = Object.fromEntries(
				action.payload.map((item) => [item.id, item]),
			);
		},
		/**
		 * ドキュメント読み込みを開始する。
		 * @param action.payload 読み込む documentId
		 */
		documentLoadRequested: (state, action: PayloadAction<string>) => {
			state.activeDocumentId = action.payload;
			state.status = 'loading';
			state.errorMessage = '';
		},
		/**
		 * ドキュメント読み込みに成功した結果を反映する。
		 */
		documentLoadCompleted: (
			state,
			action: PayloadAction<{
				documentId: string;
				path: string;
				title: string;
				content: string;
				sha: string;
			}>,
		) => {
			state.activeDocumentId = action.payload.documentId;
			state.activeDocumentPath = action.payload.path;
			state.activeDocumentTitle = action.payload.title;
			state.sourceContent = action.payload.content;
			state.draftContent = action.payload.content;
			state.activeSha = action.payload.sha;
			state.status = 'loaded';
			state.errorMessage = '';
		},
		/**
		 * ドキュメント読み込みに失敗した結果を反映する。
		 * @param action.payload エラーメッセージ
		 */
		documentLoadFailed: (state, action: PayloadAction<string>) => {
			state.status = 'error';
			state.errorMessage = action.payload;
		},
		/**
		 * プレビュー/編集モードを切り替える。
		 * @param action.payload 表示モード
		 */
		viewModeChanged: (state, action: PayloadAction<MarkdownViewMode>) => {
			state.viewMode = action.payload;
		},
		/**
		 * 編集中テキストを更新する。
		 * @param action.payload 新しいテキスト
		 */
		draftContentChanged: (state, action: PayloadAction<string>) => {
			state.draftContent = action.payload;
		},
		/**
		 * 保存処理を開始する。
		 */
		documentSaveRequested: (state) => {
			state.status = 'saving';
			state.errorMessage = '';
		},
		/**
		 * 保存結果を反映する。
		 * @param action.payload 保存後 sha
		 */
		documentSaveCompleted: (
			state,
			action: PayloadAction<{ sha: string }>,
		) => {
			state.activeSha = action.payload.sha;
			state.sourceContent = state.draftContent;
			state.status = 'loaded';
			state.errorMessage = '';
		},
		/**
		 * 保存失敗を反映する。
		 * @param action.payload エラーメッセージ
		 */
		documentSaveFailed: (state, action: PayloadAction<string>) => {
			state.status = 'error';
			state.errorMessage = action.payload;
		},
	},
});

export const markdownActions = markdownSlice.actions;
export const markdownReducer = markdownSlice.reducer;
