import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CounterState = {
	pendingAmount: number;
	status: 'idle' | 'loading';
	value: number;
};

const initialState: CounterState = {
	pendingAmount: 1,
	status: 'idle',
	value: 0,
};

const counterSlice = createSlice({
	name: 'counter',
	initialState,
	reducers: {
		decrement: (state) => {
			state.pendingAmount = 1;
			state.status = 'idle';
			state.value -= 1;
		},
		increment: (state) => {
			state.pendingAmount = 1;
			state.status = 'idle';
			state.value += 1;
		},
		incrementAsyncRequested: (state, action: PayloadAction<number>) => {
			state.pendingAmount = action.payload || 1;
			state.status = 'loading';
		},
		incrementByAmount: (state, action: PayloadAction<number>) => {
			state.pendingAmount = 1;
			state.status = 'idle';
			state.value += action.payload;
		},
	},
});

export const counterActions = counterSlice.actions;
export const counterReducer = counterSlice.reducer;
