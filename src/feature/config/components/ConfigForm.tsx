import { Button, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../core/store';
import { PERSISTED_CONFIG_KEYS, configActions } from '../state/configSlice';

export function ConfigForm() {
	const dispatch = useAppDispatch();
	const docsApiKey = useAppSelector(
		(state) => state.config.values.DOCS_API_KEY ?? '',
	);
	const storedDocsApiKey = useAppSelector(
		(state) => state.config.storedValues.DOCS_API_KEY ?? '',
	);
	const isDocsApiKeyDirty = docsApiKey !== storedDocsApiKey;

	return (
		<Stack spacing={2}>
			<Typography variant="h5">Config</Typography>
			<TextField
				label="DOCS_API_KEY"
				value={docsApiKey}
				error={isDocsApiKeyDirty}
				helperText={
					isDocsApiKeyDirty
						? '未保存の変更があります'
						: 'localStorageと同期済み'
				}
				sx={
					isDocsApiKeyDirty
						? {
								'& .MuiOutlinedInput-root': {
									backgroundColor: 'rgba(245, 124, 0, 0.08)',
								},
							}
						: undefined
				}
				onChange={(event) =>
					dispatch(
						configActions.setConfigValue({
							key: 'DOCS_API_KEY',
							value: event.target.value,
						}),
					)
				}
				fullWidth
			/>
			<Stack direction="row" spacing={1}>
				<Button
					variant="contained"
					onClick={() =>
						dispatch(
							configActions.saveToStorageRequested([
								...PERSISTED_CONFIG_KEYS,
							]),
						)
					}
				>
					保存
				</Button>
				<Button
					variant="outlined"
					onClick={() =>
						dispatch(
							configActions.hydrateFromStorageRequested([
								...PERSISTED_CONFIG_KEYS,
							]),
						)
					}
				>
					リセット
				</Button>
			</Stack>
		</Stack>
	);
}
