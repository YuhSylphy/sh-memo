import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import './core/routes/githubPagesRedirect';
import './index.css';
import App from './App.tsx';
import { store } from './core/store';
import { ErrorBoundaryFallback } from './core/common/component/ErrorBoundaryFallback.tsx';

const theme = createTheme({
	palette: {
		background: {
			default: '#f4efe8',
			paper: '#fffaf3',
		},
		primary: {
			main: '#6f4a2f',
		},
		secondary: {
			main: '#0f7a71',
		},
	},
	shape: {
		borderRadius: 16,
	},
	typography: {
		fontFamily: '"Aptos", "Segoe UI Variable", "Segoe UI", sans-serif',
		h1: {
			fontFamily: '"Iowan Old Style", Georgia, serif',
			fontWeight: 600,
		},
		h2: {
			fontFamily: '"Iowan Old Style", Georgia, serif',
			fontWeight: 600,
		},
	},
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<HelmetProvider>
			<ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Provider store={store}>
						<App />
					</Provider>
				</ThemeProvider>
			</ErrorBoundary>
		</HelmetProvider>
	</StrictMode>,
);
