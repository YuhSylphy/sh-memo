import { useEffect, useRef } from 'react';
import { appActions, useAppDispatch } from './core/store';
import { AppRoutes } from './core/routes';

/**
 * hooks
 */
function useAppInitialize() {
	const dispatch = useAppDispatch();
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		// 動的 import によるチャンク分割で各 lazy モジュールは非同期読み込みになる。
		// 各モジュールはロード時に addStoreEpic を呼ぶため、
		// 全チャンクの読み込み完了前に appInitialized を dispatch すると
		// epic が action を逃すレースコンディションが発生する。
		// Promise.all で全 epic 登録の完了を保証してから初期化アクションを発火する。
		Promise.all([
			import('./feature/config/lazy'),
			import('./feature/markdown/lazy'),
			import('./core/frame/lazy'),
		]).then(() => {
			dispatch(appActions.appInitialized());
		});
	}, [dispatch]);
}

/**
 * アプリケーションのエントリポイント。
 * - アプリケーションの初期化処理を行う。
 * - ルーティングを提供する。
 */
function App() {
	useAppInitialize();
	return <AppRoutes />;
}

export default App;
