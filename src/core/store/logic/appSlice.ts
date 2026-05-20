import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const APP_LABEL_DEFAULT = 'app';

type AppState = {
	/** 初期化完了フラグ。 */
	initialized: boolean;
	/** MainFrame ヘッダーへ表示するラベル。 */
	label: string;
	/** ページタイトル上書き文字列。未設定時は空文字。 */
	titleOverride: string;
	/** 上書きの所有者ID。未設定時は空文字。 */
	titleOverrideOwnerId: string;
};

const initialState: AppState = {
	initialized: false,
	label: APP_LABEL_DEFAULT,
	titleOverride: '',
	titleOverrideOwnerId: '',
};

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		/**
		 * App の初期化完了を記録する。
		 */
		appInitialized: (state) => {
			state.initialized = true;
		},
		/**
		 * MainFrame ヘッダーラベルを更新する。
		 * @param action.payload 表示ラベル文字列
		 */
		appLabelSet: (state, action: PayloadAction<string>) => {
			state.label = action.payload;
		},
		/**
		 * ページタイトル上書きを設定する。
		 * @param action.payload.title 上書き対象のタイトル
		 * @param action.payload.ownerId 上書き所有者ID
		 */
		appTitleOverrideSet: (
			state,
			action: PayloadAction<{ title: string; ownerId: string }>,
		) => {
			state.titleOverride = action.payload.title;
			state.titleOverrideOwnerId = action.payload.ownerId;
		},
		/**
		 * ページタイトル上書きを解除する。
		 * @param action.payload.ownerId 上書き所有者ID
		 */
		appTitleOverrideCleared: (
			state,
			action: PayloadAction<{ ownerId: string }>,
		) => {
			if (state.titleOverrideOwnerId !== action.payload.ownerId) {
				return;
			}

			state.titleOverride = '';
			state.titleOverrideOwnerId = '';
		},
	},
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
