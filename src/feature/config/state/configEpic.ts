import type { AppEpic } from '../../../core/store';
import { filter, map, merge } from 'rxjs';
import { appActions } from '../../../core/store';
import {
	PERSISTED_CONFIG_KEYS,
	type ConfigKey,
	configActions,
} from './configSlice';

function readConfigFromStorage(keys: ConfigKey[]) {
	const values: Partial<Record<ConfigKey, string>> = {};
	for (const key of keys) {
		const stored = localStorage.getItem(key);
		values[key] = stored ?? '';
	}
	return values;
}

const hydrateFromStorageEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(configActions.hydrateFromStorageRequested.match),
		map(({ payload }) => {
			const keys = payload?.length ? payload : [...PERSISTED_CONFIG_KEYS];
			return configActions.hydrateFromStorageCompleted(
				readConfigFromStorage(keys),
			);
		}),
	);

const hydrateOnAppInitializedEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(appActions.appInitialized.match),
		map(() =>
			configActions.hydrateFromStorageRequested([
				...PERSISTED_CONFIG_KEYS,
			]),
		),
	);

const persistToStorageEpic: AppEpic = (action$, state$) =>
	action$.pipe(
		filter(configActions.saveToStorageRequested.match),
		map(({ payload }) => {
			const keys = payload?.length ? payload : [...PERSISTED_CONFIG_KEYS];
			const currentValues = state$.value.config.values;
			const savedValues: Partial<Record<ConfigKey, string>> = {};

			for (const key of keys) {
				const value = currentValues[key] ?? '';
				savedValues[key] = value;

				if (value) {
					localStorage.setItem(key, value);
				} else {
					localStorage.removeItem(key);
				}
			}

			return configActions.saveToStorageCompleted(savedValues);
		}),
	);

export const configEpic: AppEpic = (action$, state$, dependencies) =>
	merge(
		hydrateOnAppInitializedEpic(action$, state$, dependencies),
		hydrateFromStorageEpic(action$, state$, dependencies),
		persistToStorageEpic(action$, state$, dependencies),
	);
