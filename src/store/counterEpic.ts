import { combineEpics, type Epic } from 'redux-observable';
import { delay, filter, map } from 'rxjs';
import { counterActions } from './counterSlice';

const incrementAsyncEpic: Epic = (action$) =>
	action$.pipe(
		filter(counterActions.incrementAsyncRequested.match),
		delay(400),
		map(({ payload }) => counterActions.incrementByAmount(payload || 1)),
	);

export const rootEpic = combineEpics(incrementAsyncEpic);
