import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	CircularProgress,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../core/store';
import { markdownActions } from '../state/markdownSlice';
import { MarkdownEditorPane } from './MarkdownEditorPane';
import { MarkdownViewerPane } from './MarkdownViewerPane';

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
	const isEditMode = state.viewMode === 'edit';

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
					<Button onClick={openPreview} disabled={!isEditMode}>
						Preview
					</Button>
					<Button onClick={openEdit} disabled={isEditMode}>
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
			) : (
				<Paper sx={{ padding: 2 }}>
					<MarkdownViewerPane
						visible={!isEditMode}
						markdown={state.draftContent}
					/>
					<MarkdownEditorPane
						visible={isEditMode}
						state={state}
						updateDraft={updateDraft}
						saveDraft={saveDraft}
						isSaving={isSaving}
					/>
				</Paper>
			)}
		</Stack>
	);
}
