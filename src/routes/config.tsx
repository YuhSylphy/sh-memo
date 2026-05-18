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
				lazy: async () => {
					const { SamplePage } = await import('../pages/sample/lazy');
					return { Component: SamplePage };
				},
			},
		],
	},
];