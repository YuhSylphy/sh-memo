import { useEffect, useRef } from 'react';
import { appActions, useAppDispatch } from './core/store';
import { AppRoutes } from './core/routes';
import './feature/config/lazy';
import './core/frame/lazy';

function App() {
	const dispatch = useAppDispatch();
	const initialized = useRef(false);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;
		dispatch(appActions.appInitialized());
	}, [dispatch]);

	return <AppRoutes />;
}

export default App;
