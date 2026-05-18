import { Navigate, type RouteObject } from 'react-router-dom';

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
				lazy: async () => ({
					Component: (await import('../pages/sample')).default,
				}),
			},
		],
	},
];
