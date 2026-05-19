import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { MainFrame } from './MainFrame';

const meta = {
	title: 'Layout/MainFrame',
	component: MainFrame,
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
} satisfies Meta<typeof MainFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: <Typography>Page content goes here.</Typography>,
	},
};

