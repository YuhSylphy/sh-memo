import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { store } from '../../../core/store';
import { CounterPanel } from '../lazy';

describe('CounterPanel', () => {
	it('increments through the epic after a short delay', async () => {
		const user = userEvent.setup();

		render(
			<Provider store={store}>
				<CounterPanel />
			</Provider>,
		);

		const asyncButton = screen.getByRole('button', {
			name: /increment async/i,
		});

		await waitFor(() => {
			expect(asyncButton).toBeEnabled();
		});

		await user.click(asyncButton);

		expect(
			screen.getByText(/syncing through the epic/i),
		).toBeInTheDocument();

		expect(await screen.findByText('Current value: 1')).toBeInTheDocument();
	});
});
