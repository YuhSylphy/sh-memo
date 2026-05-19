import { Navigate, type RouteObject } from 'react-router-dom';
import { FramedLayout } from './FramedLayout';

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

			// MainFrame あり
			{
				Component: FramedLayout,
				children: [
					{
						path: 'sample',
						handle: { title: 'Sample' } satisfies RouteHandle,
						lazy: async () => ({
							Component: (await import('../../pages/sample'))
								.default,
						}),
					},
				],
			},

			// MainFrame なし
			// {
			// 	Component: Outlet,
			// 	children: [
			// 		{
			// 			path: 'login',
			// 			handle: { title: 'Login' } satisfies RouteHandle,
			// 			lazy: async () => ({
			// 				Component: (await import('../pages/login')).default,
			// 			}),
			// 		},
			// 	],
			// },
		],
	},
];
