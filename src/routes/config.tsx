import { Navigate, type RouteObject } from 'react-router-dom';

export type RouteHandle = {
	title?: string;
};

export const appRoutes: RouteObject[] = [
	{
		path: '/',
		children: [
			{
				index: true,
				element: <Navigate to="/sample" replace />,
			},
			{
				path: 'sample',
				handle: { title: 'Sample' } satisfies RouteHandle,
				lazy: async () => ({
					Component: (await import('../pages/sample')).default,
				}),
			},
		],
	},
];
