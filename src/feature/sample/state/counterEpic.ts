import type { AppEpic } from '../../../core/store';
import { delay, filter, map } from 'rxjs';
import { normalizeCounterIncrementAmount } from '../logic/counterAmount';
import { counterActions } from './counterSlice';

export const counterEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(counterActions.incrementAsyncRequested.match),
		delay(400),
		map(({ payload }) =>
			counterActions.incrementByAmount(
				normalizeCounterIncrementAmount(payload),
			),
		),
	);
