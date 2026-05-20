import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const PERSISTED_CONFIG_KEYS = ['DOCS_API_KEY'] as const;
export type ConfigKey = (typeof PERSISTED_CONFIG_KEYS)[number];

export type ConfigState = {
	values: Partial<Record<ConfigKey, string>>;
	storedValues: Partial<Record<ConfigKey, string>>;
};

const initialState: ConfigState = {
	values: {},
	storedValues: {},
};

const configSlice = createSlice({
	name: 'config',
	initialState,
	reducers: {
		hydrateFromStorageRequested: (
			state,
			_action: PayloadAction<ConfigKey[] | undefined>,
		) => state,
		hydrateFromStorageCompleted: (
			state,
			action: PayloadAction<Partial<Record<ConfigKey, string>>>,
		) => {
			state.values = {
				...state.values,
				...action.payload,
			};
			state.storedValues = {
				...state.storedValues,
				...action.payload,
			};
		},
		saveToStorageRequested: (
			state,
			_action: PayloadAction<ConfigKey[] | undefined>,
		) => state,
		saveToStorageCompleted: (
			state,
			action: PayloadAction<Partial<Record<ConfigKey, string>>>,
		) => {
			state.storedValues = {
				...state.storedValues,
				...action.payload,
			};
		},
		setConfigValue: (
			state,
			action: PayloadAction<{ key: ConfigKey; value: string }>,
		) => {
			state.values[action.payload.key] = action.payload.value;
		},
	},
});

export const configActions = configSlice.actions;
export const configReducer = configSlice.reducer;
