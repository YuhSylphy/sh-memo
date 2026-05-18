import AddRounded from '@mui/icons-material/AddRounded';
import AutoModeRounded from '@mui/icons-material/AutoModeRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import {
	Button,
	Card,
	CardContent,
	Chip,
	Stack,
	Typography,
} from '@mui/material';
import {
	DataGrid,
	type GridColDef,
	type GridValidRowModel,
} from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'react-redux';
import type { AppStore } from '../../../core/store';
import { useAppDispatch, useAppSelector } from '../../../core/store/hooks';
import { counterActions } from '../index';
import { registerCounterFeature } from '../lazy';

type CounterGridRow = GridValidRowModel & {
	id: string;
	metric: string;
	value: string;
	details: string;
};

const columns: GridColDef<CounterGridRow>[] = [
	{
		field: 'metric',
		headerName: 'Metric',
		flex: 0.85,
		minWidth: 120,
		sortable: false,
	},
	{
		field: 'value',
		headerName: 'Value',
		flex: 0.7,
		minWidth: 120,
		sortable: false,
	},
	{
		field: 'details',
		headerName: 'Details',
		flex: 1.2,
		minWidth: 180,
		sortable: false,
	},
];

function CounterPanel() {
	const dispatch = useAppDispatch();
	const store = useStore() as AppStore;
	const { status, value } = useAppSelector((state) => state.counter);
	const [isAsyncReady, setIsAsyncReady] = useState(false);

	useEffect(() => {
		void registerCounterFeature(store.addEpic).then(() => {
			setIsAsyncReady(true);
		});
	}, [store]);

	const rows = useMemo<CounterGridRow[]>(
		() => [
			{
				id: 'counter-value',
				metric: 'Counter value',
				value: String(value),
				details:
					status === 'loading'
						? 'Epic is processing async increment'
						: 'Ready for sync or async update',
			},
			{
				id: 'update-mode',
				metric: 'Update mode',
				value: status === 'loading' ? 'Async' : 'Sync',
				details:
					status === 'loading'
						? 'Awaiting RxJS delayed action'
						: 'Immediate reducer action',
			},
		],
		[status, value],
	);

	return (
		<Card
			elevation={0}
			sx={{
				height: '100%',
				border: '1px solid',
				borderColor: 'rgba(15, 122, 113, 0.25)',
				background:
					'linear-gradient(168deg, rgba(255, 253, 247, 0.95), rgba(239, 248, 246, 0.9))',
			}}
		>
			<CardContent sx={{ p: 3.25 }}>
				<Stack spacing={2.2}>
					<Stack
						direction="row"
						sx={{
							justifyContent: 'space-between',
							alignItems: 'flex-start',
						}}
					>
						<Stack spacing={0.6}>
							<Typography
								variant="overline"
								sx={{
									fontWeight: 700,
									letterSpacing: '0.15em',
									color: 'secondary.main',
								}}
							>
								Redux + RxJS
							</Typography>
							<Typography variant="h5">Counter workflow</Typography>
							<Typography variant="body2" color="text.secondary">
								MUI ボタンで dispatch し、非同期は epic 経由で反映します。
							</Typography>
						</Stack>
						<Chip
							label={
								status === 'loading'
									? 'Syncing through the epic...'
									: `Current value: ${value}`
							}
							color={status === 'loading' ? 'warning' : 'secondary'}
							variant="filled"
							size="small"
						/>
					</Stack>

					<Stack
						direction="row"
						spacing={1.2}
						useFlexGap
						sx={{ flexWrap: 'wrap' }}
					>
						<Button
							variant="outlined"
							startIcon={<RemoveRounded />}
							onClick={() => dispatch(counterActions.decrement())}
						>
							Decrement
						</Button>
						<Button
							variant="contained"
							startIcon={<AddRounded />}
							onClick={() => dispatch(counterActions.increment())}
						>
							Increment
						</Button>
						<Button
							variant="contained"
							color="secondary"
							startIcon={<AutoModeRounded />}
							disabled={!isAsyncReady}
							onClick={() =>
								dispatch(counterActions.incrementAsyncRequested(1))
							}
						>
							Increment async
						</Button>
					</Stack>

					<DataGrid
						autoHeight
						rows={rows}
						columns={columns}
						hideFooter
						disableColumnMenu
						disableColumnResize
						disableRowSelectionOnClick
						sx={{
							borderRadius: 2,
							bgcolor: 'rgba(255, 255, 255, 0.64)',
							'& .MuiDataGrid-columnHeaders': {
								fontWeight: 700,
							},
						}}
					/>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default CounterPanel;