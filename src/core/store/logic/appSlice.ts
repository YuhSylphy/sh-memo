import { createSlice } from '@reduxjs/toolkit';

type AppState = {
	initialized: boolean;
};

const initialState: AppState = {
	initialized: false,
};

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		appInitialized: (state) => {
			state.initialized = true;
		},
	},
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
