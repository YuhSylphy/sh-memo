import {
	Outlet,
	RouterProvider,
	createBrowserRouter,
	useMatches,
} from 'react-router-dom';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
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

function RouteHydrateFallback() {
	return (
		<Box
			sx={{
				display: 'grid',
				placeItems: 'center',
				minHeight: '100vh',
			}}
		>
			<CircularProgress size={28} />
		</Box>
	);
}

const appRouter = createBrowserRouter(
	[
		{
			Component: RootLayout,
			HydrateFallback: RouteHydrateFallback,
			children: appRoutes,
		},
	],
	{ basename: import.meta.env.BASE_URL },
);

export function AppRoutes() {
	return <RouterProvider router={appRouter} />;
}
