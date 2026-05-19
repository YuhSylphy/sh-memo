import { Outlet } from 'react-router-dom';
import { MainFrame } from '../frame';

export function FramedLayout() {
	return (
		<MainFrame>
			<Outlet />
		</MainFrame>
	);
}
