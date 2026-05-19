import {
	Outlet,
	RouterProvider,
	createBrowserRouter,
	useMatches,
} from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { type RouteHandle, appRoutes } from './config';

const APP_NAME = 'app';

function RouteTitle() {
	const matches = useMatches();
	const handledTitle = matches
		.map((m) => (m.handle as RouteHandle | undefined)?.title)
		.filter(Boolean)
		.at(-1);
	const title = handledTitle ? `${handledTitle} | ${APP_NAME}` : APP_NAME;

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
