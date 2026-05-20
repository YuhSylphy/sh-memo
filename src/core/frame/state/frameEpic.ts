import type { AppEpic } from '../../store';
import { filter, from, map, merge, catchError, of, switchMap } from 'rxjs';
import { fetchNavItems } from '../logic/navItems';
import { frameActions } from './frameSlice';
import { configActions } from '../../../feature/config';

// Helper: wrap fetchNavItems() into the fetch → completed/failed action sequence.
function fetchNavItemsActions$() {
	return from(fetchNavItems()).pipe(
		map((items) => frameActions.navItemsFetchCompleted(items)),
		catchError(() => of(frameActions.navItemsFetchFailed())),
	);
}

// Trigger 1: fetch after config is hydrated from storage (startup/reset).
const navItemsOnConfigHydratedEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(configActions.hydrateFromStorageCompleted.match),
		switchMap(() => fetchNavItemsActions$()),
	);

// Trigger 2: re-fetch after config is persisted (manual save).
const navItemsOnConfigSavedEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(configActions.saveToStorageCompleted.match),
		switchMap(() => fetchNavItemsActions$()),
	);

export const frameEpic: AppEpic = (action$, state$, dependencies) =>
	merge(
		navItemsOnConfigHydratedEpic(action$, state$, dependencies),
		navItemsOnConfigSavedEpic(action$, state$, dependencies),
	);
