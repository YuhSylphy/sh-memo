import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const APP_LABEL_DEFAULT = 'app';

type AppState = {
	initialized: boolean;
	label: string;
};

const initialState: AppState = {
	initialized: false,
	label: APP_LABEL_DEFAULT,
};

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		appInitialized: (state) => {
			state.initialized = true;
		},
		appLabelSet: (state, action: PayloadAction<string>) => {
			state.label = action.payload;
		},
	},
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
