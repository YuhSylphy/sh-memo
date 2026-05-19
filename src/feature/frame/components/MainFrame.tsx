import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export function MainFrame({ children }: Props) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div">
						app
					</Typography>
				</Toolbar>
			</AppBar>
			<Container component="main" sx={{ flex: 1, py: 3 }}>
				{children}
			</Container>
		</Box>
	);
}
