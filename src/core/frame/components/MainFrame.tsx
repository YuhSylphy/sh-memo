import {
	AppBar,
	Box,
	Container,
	Drawer,
	IconButton,
	List,
	ListItemButton,
	ListItemText,
	Toolbar,
	Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

type NavItem = {
	label: string;
	to: string;
};

export const navItems: NavItem[] = [
	{ label: 'サンプルページ', to: '/sample' },
];

export function MainFrame({ children }: PropsWithChildren) {
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

			<Drawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			>
				<Typography variant="subtitle1" sx={{ px: 2, py: 1.5, fontWeight: 'bold' }}>
					Menu
				</Typography>
				<List sx={{ width: 240 }}>
					{navItems.map((item) => (
						<ListItemButton
							key={item.to}
							component={Link}
							to={item.to}
							onClick={() => setDrawerOpen(false)}
						>
							<ListItemText primary={item.label} />
						</ListItemButton>
					))}
				</List>
			</Drawer>

			<Container component="main" sx={{ flex: 1, py: 3 }}>
				{children}
			</Container>
		</Box>
	);
}
