import type { AppEpic } from '../../../core/store';
import {
	catchError,
	distinctUntilChanged,
	filter,
	from,
	map,
	merge,
	mergeMap,
	of,
	switchMap,
} from 'rxjs';
import { configActions } from '../../config';
import { fetchDynamicMenuDefs } from '../../../core/frame/logic/navItems';
import { fetchRepositoryFile, updateRepositoryFileContent } from '../../github';
import { buildDocumentIndex } from '../logic/documentIndex';
import { markdownActions } from './markdownSlice';

/**
 * menu.yaml から markdown の id/path 索引を同期する。
 */
const syncDocumentIndexEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(
			(action) =>
				configActions.hydrateFromStorageCompleted.match(action) ||
				configActions.saveToStorageCompleted.match(action),
		),
		switchMap(() =>
			from(fetchDynamicMenuDefs()).pipe(
				map((defs) =>
					markdownActions.documentIndexLoaded(
						buildDocumentIndex(defs),
					),
				),
				catchError((error) => {
					console.warn(
						'[markdown] failed to sync menu index. fallback to empty index.',
						error,
					);
					return of(markdownActions.documentIndexLoaded([]));
				}),
			),
		),
	);

/**
 * documentId から markdown 本文を取得する。
 */
const loadDocumentEpic: AppEpic = (action$, state$) =>
	action$.pipe(
		filter(markdownActions.documentLoadRequested.match),
		map((action) => action.payload),
		distinctUntilChanged(),
		switchMap((documentId) => {
			const index = state$.value.markdown.documentIndexById[documentId];
			if (!index) {
				return of(
					markdownActions.documentLoadFailed(
						`Document index not found for id: ${documentId}`,
					),
				);
			}

			return from(fetchRepositoryFile(index.path)).pipe(
				map((file) =>
					markdownActions.documentLoadCompleted({
						documentId,
						path: file.path,
						title: index.title,
						content: file.content,
						sha: file.sha,
					}),
				),
				catchError((error) =>
					of(
						markdownActions.documentLoadFailed(
							error instanceof Error
								? error.message
								: 'Failed to load markdown document.',
						),
					),
				),
			);
		}),
	);

/**
 * 編集内容を GitHub Content API へ保存する。
 */
const saveDocumentEpic: AppEpic = (action$, state$) =>
	action$.pipe(
		filter(markdownActions.documentSaveRequested.match),
		switchMap(() => {
			const state = state$.value.markdown;
			if (!state.activeDocumentPath || !state.activeSha) {
				return of(
					markdownActions.documentSaveFailed(
						'Document path or sha is missing.',
					),
				);
			}

			return from(
				updateRepositoryFileContent(
					state.activeDocumentPath,
					state.draftContent,
					state.activeSha,
				),
			).pipe(
				map((result) =>
					markdownActions.documentSaveCompleted({ sha: result.sha }),
				),
				catchError((error) =>
					of(
						markdownActions.documentSaveFailed(
							error instanceof Error
								? error.message
								: 'Failed to save markdown document.',
						),
					),
				),
			);
		}),
	);

/**
 * documentIndexLoaded 後に全ドキュメントを並列プリフェッチして SW キャッシュを温める。
 * 取得結果は破棄（副作用として Service Worker にキャッシュさせることが目的）。
 * オフライン時はサイレントにスキップ。
 */
const prewarmCacheEpic: AppEpic = (action$) =>
	action$.pipe(
		filter(markdownActions.documentIndexLoaded.match),
		switchMap((action) => {
			if (!navigator.onLine) return of();
			const items = Object.values(
				Object.fromEntries(
					action.payload.map((item) => [item.id, item]),
				),
			);
			return from(items).pipe(
				mergeMap(
					(item) =>
						from(fetchRepositoryFile(item.path)).pipe(
							catchError(() => of(null)), // 個別失敗は無視
						),
					3, // concurrency
				),
				// 全件取得しても dispatch するアクションなし
				map(() => ({ type: '@@pwa/prewarm-noop' as const })),
				catchError(() => of()),
			);
		}),
	);

export const markdownEpic: AppEpic = (action$, state$, dependencies) =>
	merge(
		syncDocumentIndexEpic(action$, state$, dependencies),
		loadDocumentEpic(action$, state$, dependencies),
		saveDocumentEpic(action$, state$, dependencies),
		prewarmCacheEpic(action$, state$, dependencies),
	);
