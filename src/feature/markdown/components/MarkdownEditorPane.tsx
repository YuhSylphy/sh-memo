import { Button, Stack, TextField } from '@mui/material';
import { type MarkdownState } from '../state/markdownSlice';

export interface MarkdownEditorPaneProps {
	visible: boolean;
	state: MarkdownState;
	updateDraft: (nextText: string) => void;
	saveDraft: () => void;
	isSaving: boolean;
}

export function MarkdownEditorPane({
	visible,
	state,
	updateDraft,
	saveDraft,
	isSaving,
}: MarkdownEditorPaneProps): React.ReactNode {
	return (
		<Stack spacing={1.5} sx={{ display: visible ? 'block' : 'none' }}>
			<TextField
				multiline
				minRows={18}
				maxRows={36}
				value={state.draftContent}
				onChange={(event) => updateDraft(event.target.value)}
				fullWidth
			/>
			<Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
				<Button
					variant="contained"
					onClick={saveDraft}
					disabled={isSaving}
				>
					{isSaving ? 'Saving...' : 'Save'}
				</Button>
			</Stack>
		</Stack>
	);
}
