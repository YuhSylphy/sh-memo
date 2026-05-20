import { useParams } from 'react-router-dom';
import { MarkdownRenderer } from '../../../feature/markdown/lazy';
import { usePageTitleOverride } from '../../../core/routes';
import { useAppSelector } from '../../../core/store';

function useDocsPageHooks(documentId: string) {
	const dynamicTitle = useAppSelector((state) =>
		documentId
			? (state.markdown.documentIndexById[documentId]?.title ?? '')
			: '',
	);

	usePageTitleOverride(dynamicTitle);

	return {
		documentId,
	};
}

export function DocsPage() {
	const { documentId } = useParams<{ documentId: string }>();
	const { documentId: resolvedDocumentId } = useDocsPageHooks(
		documentId ?? '',
	);
	return <MarkdownRenderer documentId={resolvedDocumentId} />;
}
