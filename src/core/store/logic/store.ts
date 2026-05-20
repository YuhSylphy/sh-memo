import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware, type Epic } from 'redux-observable';
import { BehaviorSubject, EMPTY, mergeMap } from 'rxjs';
import { rootReducer, type RootState } from './reducers';

export type AppEpic = Epic<unknown, unknown, RootState>;
export type AddEpic = (epic: AppEpic) => void;

const noopEpic: AppEpic = () => EMPTY;

const createEpicManager = () => {
	const epic$ = new BehaviorSubject<AppEpic>(noopEpic);
	const registeredEpics = new Set<AppEpic>();

	const rootEpic: AppEpic = (action$, state$, dependencies) =>
		epic$.pipe(mergeMap((epic) => epic(action$, state$, dependencies)));

	const addEpic: AddEpic = (epic) => {
		if (registeredEpics.has(epic)) {
			return;
		}

		registeredEpics.add(epic);
		epic$.next(epic);
	};

	return {
		addEpic,
		rootEpic,
	};
};

export const createAppStore = () => {
	const epicMiddleware = createEpicMiddleware<unknown, unknown, RootState>();
	const epicManager = createEpicManager();

	const appStore = configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}).concat(epicMiddleware),
	});

	epicMiddleware.run(epicManager.rootEpic);

	return Object.assign(appStore, {
		addEpic: epicManager.addEpic,
	});
};

export const store = createAppStore();
export const addStoreEpic: AddEpic = (epic) => store.addEpic(epic);

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];

export type { RootState };
