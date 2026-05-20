import {
	AppBar,
	Box,
	CircularProgress,
	Collapse,
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
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { type NavItem } from '../logic/navItems';

type NavMenuListProps = {
	items: NavItem[];
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

type NavMenuItemsProps = {
	items: NavItem[];
	onSelect: () => void;
	depth?: number;
};

function NavMenuItems({ items, onSelect, depth = 0 }: NavMenuItemsProps) {
	const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());

	const toggleOpen = (label: string) => {
		setOpenKeys((prev) => {
			const next = new Set(prev);
			if (next.has(label)) {
				next.delete(label);
			} else {
				next.add(label);
			}
			return next;
		});
	};

	return (
		<>
			{items.map((item) => {
				const hasChildren = item.children && item.children.length > 0;
				const isOpen = openKeys.has(item.label);

				return (
					<div key={item.label}>
						<ListItemButton
							sx={{ pl: 2 + depth * 2 }}
							{...(hasChildren
								? { onClick: () => toggleOpen(item.label) }
								: {
										component: Link,
										to: item.to ?? '/',
										onClick: onSelect,
									})}
						>
							<NavItemIcon icon={item.icon} />
							<ListItemText primary={item.label} />
							{hasChildren &&
								(isOpen ? <ExpandLess /> : <ExpandMore />)}
						</ListItemButton>
						{hasChildren && (
							<Collapse in={isOpen} timeout="auto" unmountOnExit>
								<NavMenuItems
									items={item.children!}
									onSelect={onSelect}
									depth={depth + 1}
								/>
							</Collapse>
						)}
					</div>
				);
			})}
		</>
	);
}

function NavMenuList({ items, onSelect }: NavMenuListProps) {
	return (
		<List sx={{ width: 240 }}>
			<NavMenuItems items={items} onSelect={onSelect} />
		</List>
	);
}

export function MainFrame({ children }: PropsWithChildren) {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const navItems = useAppSelector((state) => state.frame.navItems);
	const navItemsStatus = useAppSelector(
		(state) => state.frame.navItemsStatus,
	);

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
				{navItemsStatus === 'loading' || navItemsStatus === 'idle' ? (
					<CircularProgress sx={{ m: 2 }} size={24} />
				) : (
					<NavMenuList
						items={navItems}
						onSelect={() => setDrawerOpen(false)}
					/>
				)}
			</Drawer>

			<Container component="main" sx={{ flex: 1, py: 3 }}>
				{children}
			</Container>
		</Box>
	);
}
