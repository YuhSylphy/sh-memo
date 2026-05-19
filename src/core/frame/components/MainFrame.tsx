import {
	AppBar,
	Box,
	CircularProgress,
	Container,
	Drawer,
	Icon,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Suspense, use, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { type NavItem, fetchNavItems } from '../logic/navItems';

type NavMenuListProps = {
	promise: Promise<NavItem[]>;
	onSelect: () => void;
};

function NavItemIcon({ icon }: { icon: NavItem['icon'] }) {
	switch (typeof icon) {
		case 'string': {
			return (
				<ListItemIcon>
					<Icon>{icon}</Icon>
				</ListItemIcon>
			);
		}
		case 'function': {
			const IconComponent = icon;
			return (
				<ListItemIcon>
					<IconComponent />
				</ListItemIcon>
			);
		}
		default:
			return null;
	}
}

function NavMenuList({ promise, onSelect }: NavMenuListProps) {
	const items = use(promise);
	return (
		<List sx={{ width: 240 }}>
			{items.map((item) => (
				<ListItemButton
					key={item.to}
					component={Link}
					to={item.to}
					onClick={onSelect}
				>
					<NavItemIcon icon={item.icon} />
					<ListItemText primary={item.label} />
				</ListItemButton>
			))}
		</List>
	);
}

export function MainFrame({ children }: PropsWithChildren) {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [navItemsPromise] = useState(() => fetchNavItems());

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
			}}
		>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						color="inherit"
						edge="start"
						aria-label="menu"
						sx={{ mr: 2 }}
						onClick={() => setDrawerOpen((prev) => !prev)}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" component="div">
						app
					</Typography>
				</Toolbar>
			</AppBar>

			<Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
				<Typography
					variant="subtitle1"
					sx={{ px: 2, py: 1.5, fontWeight: 'bold' }}
				>
					Menu
				</Typography>
				<Suspense
					fallback={<CircularProgress sx={{ m: 2 }} size={24} />}
				>
					<NavMenuList
						promise={navItemsPromise}
						onSelect={() => setDrawerOpen(false)}
					/>
				</Suspense>
			</Drawer>

			<Container component="main" sx={{ flex: 1, py: 3 }}>
				{children}
			</Container>
		</Box>
	);
}
