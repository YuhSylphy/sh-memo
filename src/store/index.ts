import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { combineReducers } from 'redux';
import { rootEpic } from './counterEpic';
import { counterReducer } from './counterSlice';

const rootReducer = combineReducers({
	counter: counterReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const createAppStore = () => {
	const epicMiddleware = createEpicMiddleware();

	const appStore = configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}).concat(epicMiddleware),
	});

	epicMiddleware.run(rootEpic);

	return appStore;
};

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
