import { combineReducers } from 'redux';
import { appReducer } from './appSlice';
import { frameReducer } from '../../frame/state/frameSlice';
import { configReducer } from '../../../feature/config';
import { markdownReducer } from '../../../feature/markdown';
import { counterReducer } from '../../../feature/sample';

export const rootReducer = combineReducers({
	app: appReducer,
	frame: frameReducer,
	config: configReducer,
	counter: counterReducer,
	markdown: markdownReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
