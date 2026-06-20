import { Box, Typography } from '@mui/material';
import { type FallbackProps } from 'react-error-boundary';

export function ErrorBoundaryFallback({ error }: FallbackProps) {
	console.error('ErrorBoundary caught an error:', error);
	const message = JSON.stringify(error, null, '\t');
	return (
		<Box>
			<Typography sx={{ whiteSpace: 'pre-line' }}>{message}</Typography>
		</Box>
	);
}
