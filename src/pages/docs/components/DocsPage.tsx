import { useParams } from 'react-router-dom';
import { MarkdownRenderer } from '../../../feature/markdown/lazy';

export function DocsPage() {
	const { documentId } = useParams<{ documentId: string }>();
	return <MarkdownRenderer documentId={documentId ?? ''} />;
}
