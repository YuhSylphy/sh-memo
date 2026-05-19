import { combineReducers } from 'redux';
import { markdownReducer } from '../../../feature/markdown';
import { counterReducer } from '../../../feature/sample';

export const rootReducer = combineReducers({
	counter: counterReducer,
	markdown: markdownReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
