import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './config';

const appRouter = createBrowserRouter(appRoutes, {
	basename: import.meta.env.BASE_URL,
});

export function AppRoutes() {
	return <RouterProvider router={appRouter} />;
}