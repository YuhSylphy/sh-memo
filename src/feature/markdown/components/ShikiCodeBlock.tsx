import { Box } from '@mui/material';
import { ShikiHighlighter, type Language } from 'react-shiki';

const languageAliases: Record<string, Language> = {
	js: 'javascript',
	ts: 'typescript',
	tsx: 'tsx',
	jsx: 'jsx',
	py: 'python',
	md: 'markdown',
	markdown: 'markdown',
	sh: 'bash',
	bash: 'bash',
	yml: 'yaml',
	yaml: 'yaml',
};

function normalizeLanguage(lang?: string | null): Language {
	if (!lang) return 'plaintext';
	const normalized = lang.trim().toLowerCase();
	return languageAliases[normalized] ?? (normalized as Language);
}

export type ShikiCodeBlockProps = {
	code: string;
	lang?: string | null;
};

/**
 * Shiki を使って Markdown のコードブロックをハイライト表示します。
 */
export function ShikiCodeBlock({ code, lang }: ShikiCodeBlockProps) {
	return (
		<Box sx={{ mb: 2, overflowX: 'auto' }}>
			<ShikiHighlighter
				language={normalizeLanguage(lang)}
				theme="github-dark-default"
				addDefaultStyles
				style={{ margin: 0, whiteSpace: 'pre', overflowX: 'auto' }}
			>
				{code}
			</ShikiHighlighter>
		</Box>
	);
}
