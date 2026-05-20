import { useEffect } from 'react';
import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	CircularProgress,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownActions } from '../state/markdownSlice';
import { useAppDispatch, useAppSelector } from '../../../core/store';

type Props = {
	/** ルートパラメータの documentId。 */
	documentId: string;
};

function useMarkdownRendererHooks(documentId: string) {
	const dispatch = useAppDispatch();
	const state = useAppSelector((rootState) => rootState.markdown);
	const indexItem = useAppSelector(
		(rootState) => rootState.markdown.documentIndexById[documentId],
	);

	useEffect(() => {
		if (!documentId || !indexItem?.path) {
			return;
		}

		dispatch(markdownActions.documentLoadRequested(documentId));
	}, [dispatch, documentId, indexItem?.path]);

	const openPreview = () =>
		dispatch(markdownActions.viewModeChanged('preview'));
	const openEdit = () => dispatch(markdownActions.viewModeChanged('edit'));
	const updateDraft = (nextText: string) =>
		dispatch(markdownActions.draftContentChanged(nextText));
	const saveDraft = () => dispatch(markdownActions.documentSaveRequested());

	return {
		state,
		indexItem,
		openPreview,
		openEdit,
		updateDraft,
		saveDraft,
	};
}

export function MarkdownRenderer({ documentId }: Props) {
	const { state, indexItem, openPreview, openEdit, updateDraft, saveDraft } =
		useMarkdownRendererHooks(documentId);

	if (!documentId) {
		return (
			<Alert severity="warning">documentId が指定されていません。</Alert>
		);
	}

	if (!indexItem) {
		return (
			<Alert severity="info">
				menu.yaml の同期待ち、または documentId が未定義です:{' '}
				{documentId}
			</Alert>
		);
	}

	const isLoading = state.status === 'loading';
	const isSaving = state.status === 'saving';

	return (
		<Stack spacing={2}>
			<Stack
				direction="row"
				spacing={2}
				sx={{ justifyContent: 'space-between' }}
			>
				<Typography variant="h5">
					{state.activeDocumentTitle || indexItem.title}
				</Typography>
				<ButtonGroup variant="outlined" size="small">
					<Button
						onClick={openPreview}
						disabled={state.viewMode === 'preview'}
					>
						Preview
					</Button>
					<Button
						onClick={openEdit}
						disabled={state.viewMode === 'edit'}
					>
						Edit
					</Button>
				</ButtonGroup>
			</Stack>

			{state.errorMessage && (
				<Alert severity="error">{state.errorMessage}</Alert>
			)}

			{isLoading ? (
				<Box
					sx={{
						display: 'grid',
						placeItems: 'center',
						minHeight: 160,
					}}
				>
					<CircularProgress size={24} />
				</Box>
			) : state.viewMode === 'preview' ? (
				<Box sx={{ '& p': { lineHeight: 1.8 } }}>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>
						{state.draftContent}
					</ReactMarkdown>
				</Box>
			) : (
				<Stack spacing={1.5}>
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
			)}
		</Stack>
	);
}
