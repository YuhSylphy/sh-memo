import {
	Outlet,
	RouterProvider,
	createBrowserRouter,
	useMatches,
} from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { type RouteHandle, appRoutes } from '../logic/config';
import { APP_LABEL_DEFAULT, appActions, useAppDispatch } from '../../store';

const APP_NAME = APP_LABEL_DEFAULT;

function RouteTitle() {
	const dispatch = useAppDispatch();
	const matches = useMatches();
	const handledTitle = matches
		.map((m) => (m.handle as RouteHandle | undefined)?.title)
		.filter(Boolean)
		.at(-1);
	const title = handledTitle ? `${handledTitle} | ${APP_NAME}` : APP_NAME;

	useEffect(() => {
		dispatch(appActions.appLabelSet(title));
	}, [dispatch, title]);

	return (
		<Helmet>
			<title>{title}</title>
		</Helmet>
	);
}

function RootLayout() {
	return (
		<>
			<RouteTitle />
			<Outlet />
		</>
	);
}

const appRouter = createBrowserRouter(
	[{ Component: RootLayout, children: appRoutes }],
	{ basename: import.meta.env.BASE_URL },
);

export function AppRoutes() {
	return <RouterProvider router={appRouter} />;
}
