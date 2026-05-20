import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NavItem } from '../logic/navItems';

export type NavItemsStatus = 'idle' | 'loading' | 'loaded' | 'error';

export type FrameState = {
	navItems: NavItem[];
	navItemsStatus: NavItemsStatus;
};

const initialState: FrameState = {
	navItems: [],
	navItemsStatus: 'idle',
};

const frameSlice = createSlice({
	name: 'frame',
	initialState,
	reducers: {
		navItemsFetchRequested: (state) => {
			state.navItemsStatus = 'loading';
		},
		navItemsFetchCompleted: (state, action: PayloadAction<NavItem[]>) => {
			state.navItems = action.payload;
			state.navItemsStatus = 'loaded';
		},
		navItemsFetchFailed: (state) => {
			state.navItemsStatus = 'error';
		},
	},
});

export const frameActions = frameSlice.actions;
export const frameReducer = frameSlice.reducer;
