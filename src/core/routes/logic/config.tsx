import { Navigate, type RouteObject } from 'react-router-dom';
import { FramedLayout } from '../components/FramedLayout';
import { buildRoutes } from './buildRoutes';
import { appNavItems, rootRedirectTo } from '../../defs/appNavItems';

export type { RouteHandle } from './buildRoutes';

const { framed, unframed } = buildRoutes(appNavItems);

export const appRoutes: RouteObject[] = [
	{
		path: '/',
		children: [
			{
				index: true,
				element: <Navigate to={rootRedirectTo} replace />,
			},

			// MainFrame あり
			{
				Component: FramedLayout,
				children: framed,
			},

			// MainFrame なし
			...unframed,
		],
	},
];
