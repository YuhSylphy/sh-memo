import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import CounterPanel from './CounterPanel';
import { createAppStore } from '../store';

const figmaUrl =
	'https://www.figma.com/file/REPLACE_WITH_YOUR_FILE/CounterPanel';

const meta = {
	title: 'State/CounterPanel',
	component: CounterPanel,
	decorators: [
		(Story) => (
			<Provider store={createAppStore()}>
				<div
					style={{
						maxWidth: '460px',
						margin: '0 auto',
						padding: '32px',
					}}
				>
					<Story />
				</div>
			</Provider>
		),
	],
	parameters: {
		docs: {
			description: {
				component: `Figma design reference: ${figmaUrl}`,
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof CounterPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
