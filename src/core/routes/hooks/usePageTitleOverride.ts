import { useEffect } from 'react';
import { v7 as uuidv7 } from 'uuid';
import { appActions, useAppDispatch } from '../../store';

/**
 * ページ単位のタイトル上書きを適用する。
 * コンポーネントがアンマウントされると自動で解除される。
 * @param title 上書きしたいページタイトル。空文字の場合は上書きしない。
 */
export function usePageTitleOverride(title: string): void {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!title) {
			return;
		}

		const ownerId = uuidv7();

		dispatch(appActions.appTitleOverrideSet({ title, ownerId }));

		return () => {
			dispatch(appActions.appTitleOverrideCleared({ ownerId }));
		};
	}, [dispatch, title]);
}
