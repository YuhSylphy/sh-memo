import { Navigate, type RouteObject } from 'react-router-dom';
import { SamplePage } from '../pages/sample';

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
				Component: SamplePage,
			},
		],
	},
];