import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from '@mui/material';
import { MainFrame } from './MainFrame';

const meta = {
	title: 'Layout/MainFrame',
	component: MainFrame,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof MainFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: <Typography>Page content goes here.</Typography>,
	},
};
