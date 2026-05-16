import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import CounterPanel from './CounterPanel';
import { createAppStore } from '../store';

describe('CounterPanel', () => {
	it('increments through the epic after a short delay', async () => {
		const user = userEvent.setup();

		render(
			<Provider store={createAppStore()}>
				<CounterPanel />
			</Provider>,
		);

		await user.click(
			screen.getByRole('button', { name: /increment async/i }),
		);

		expect(
			screen.getByText(/syncing through the epic/i),
		).toBeInTheDocument();

		expect(await screen.findByText('Current value: 1')).toBeInTheDocument();
	});
});
