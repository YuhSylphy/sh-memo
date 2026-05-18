import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import CategoryRounded from '@mui/icons-material/CategoryRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import HubRounded from '@mui/icons-material/HubRounded';
import PrecisionManufacturingRounded from '@mui/icons-material/PrecisionManufacturingRounded';
import ScienceRounded from '@mui/icons-material/ScienceRounded';
import {
	Box,
	Chip,
	Container,
	Grid,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import { CounterPanel } from '../../../feature/counter/lazy';

const featureItems = [
	{
		icon: <CategoryRounded fontSize="small" />,
		label: 'Yarn package management',
	},
	{
		icon: <PrecisionManufacturingRounded fontSize="small" />,
		label: 'ESLint with React and Hooks',
	},
	{
		icon: <AutoAwesomeRounded fontSize="small" />,
		label: 'Prettier + EditorConfig',
	},
	{
		icon: <ScienceRounded fontSize="small" />,
		label: 'Vitest + Testing Library',
	},
	{
		icon: <HubRounded fontSize="small" />,
		label: 'Redux + RxJS epic workflow',
	},
	{
		icon: <DesignServicesRounded fontSize="small" />,
		label: 'Storybook and design references',
	},
];

export function SamplePage() {
	return (
		<Box
			sx={{
				background:
					'radial-gradient(circle at 12% 16%, rgba(173, 110, 64, 0.25), transparent 30%), radial-gradient(circle at 92% 88%, rgba(48, 138, 127, 0.18), transparent 26%), #f4efe8',
				minHeight: '100vh',
				py: { xs: 3, md: 5 },
			}}
		>
			<Container maxWidth="xl">
				<Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
					<Grid size={{ xs: 12, md: 7 }}>
						<Paper
							elevation={0}
							sx={{
								height: '100%',
								border: '1px solid',
								borderColor: 'rgba(111, 74, 47, 0.16)',
								p: { xs: 3, md: 5 },
								background:
									'linear-gradient(155deg, rgba(255, 251, 244, 0.96), rgba(255, 245, 232, 0.85))',
							}}
						>
							<Chip
								color="secondary"
								label="Vite + React + TypeScript"
								sx={{ fontWeight: 700, mb: 2 }}
							/>
							<Typography
								variant="h1"
								sx={{
									fontSize: {
										xs: '2rem',
										sm: '2.5rem',
										md: '3.2rem',
									},
									lineHeight: 1.04,
									mb: 2,
								}}
							>
								Material UIベースのSPAスターターレイアウト
							</Typography>
							<Typography
								variant="body1"
								sx={{ color: 'text.secondary', maxWidth: 720 }}
							>
								MUI and MUI X based foundation for dashboards
								and internal tools.
							</Typography>
							<Stack
								direction="row"
								spacing={1}
								useFlexGap
								sx={{ mt: 3, flexWrap: 'wrap' }}
							>
								{featureItems.map((item) => (
									<Chip
										key={item.label}
										icon={item.icon}
										label={item.label}
										variant="outlined"
										sx={{
											bgcolor:
												'rgba(255, 255, 255, 0.74)',
											borderColor:
												'rgba(111, 74, 47, 0.2)',
										}}
									/>
								))}
							</Stack>
						</Paper>
					</Grid>
					<Grid size={{ xs: 12, md: 5 }}>
						<CounterPanel />
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
