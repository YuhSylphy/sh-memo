import type { AppEpic } from '../../store';
import {
	distinctUntilChanged,
	filter,
	from,
	map,
	merge,
	catchError,
	of,
	skip,
	switchMap,
} from 'rxjs';
import { appActions } from '../../store';
import { fetchNavItems } from '../logic/navItems';
import { frameActions } from './frameSlice';

// Helper: wrap fetchNavItems() into the fetch → completed/failed action sequence.
function fetchNavItemsActions$() {
	return from(fetchNavItems()).pipe(
		map((items) => frameActions.navItemsFetchCompleted(items)),
		catchError(() => of(frameActions.navItemsFetchFailed())),
	);
}

// Trigger 1: fetch on app initialized.
const navItemsOnInitEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(appActions.appInitialized.match),
		switchMap(() => fetchNavItemsActions$()),
	);

// Trigger 2: re-fetch when DOCS_API_KEY changes in config state.
// Observes state$ directly to avoid importing feature/config actions.
const navItemsOnConfigChangeEpic: AppEpic = (_action$, state$) =>
	state$.pipe(
		map((state) => state.config.values.DOCS_API_KEY),
		distinctUntilChanged(),
		skip(1), // skip initial value; appInitialized handles the first fetch
		switchMap(() => fetchNavItemsActions$()),
	);

export const frameEpic: AppEpic = (action$, state$, dependencies) =>
	merge(
		navItemsOnInitEpic(action$, state$, dependencies),
		navItemsOnConfigChangeEpic(action$, state$, dependencies),
	);
