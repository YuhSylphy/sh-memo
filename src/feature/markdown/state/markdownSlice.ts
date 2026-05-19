import { createSlice } from '@reduxjs/toolkit';

export type MarkdownState = {
	// TODO: state fields
};

const initialState: MarkdownState = {
	// TODO: initial values
};

const markdownSlice = createSlice({
	name: 'markdown',
	initialState,
	reducers: {
		// TODO: reducers
	},
});

export const markdownActions = markdownSlice.actions;
export const markdownReducer = markdownSlice.reducer;
