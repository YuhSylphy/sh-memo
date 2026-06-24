import React from 'react';

import { Box, Divider, Link, Tooltip, Typography } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { ShikiCodeBlock } from './ShikiCodeBlock';
import { SortableMarkdownTable } from './SortableMarkdownTable';

import '../logic/remark/types';

import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';

import {
	remarkNoteAside,
	remarkStyledBlock,
	remarkRuby,
	remarkFallbackDirective,
} from '../logic/remark';

import { unified, type Plugin } from 'unified';
import type { Nodes, Root } from 'mdast';
import yaml from 'js-yaml';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundaryFallback } from '../../../core/common/component/ErrorBoundaryFallback';

export type MarkdownViewerPaneProps = {
	visible: boolean;
	markdown: string;
};

const remarkDebug: Plugin = () => (tree) => {
	console.log('AST:', tree);
};

const processor = unified()
	.use(remarkParse)
	.use(remarkFrontmatter, ['yaml'])
	.use(remarkGfm)
	.use(remarkDirective)
	.use(remarkNoteAside)
	.use(remarkRuby)
	.use(remarkStyledBlock)
	.use(remarkFallbackDirective)
	.use(remarkDebug);

/**
 * 与えられたオブジェクトがmdastのNode構造を満たしているかを判定する型ガード関数。
 * @param node
 * @returns
 */
function isMdastNode(node: unknown): node is Nodes {
	if (typeof node !== 'object' || node === null) return false;
	const t = (node as { type?: unknown }).type as Nodes['type'];
	if (typeof t !== 'string') return false;

	switch (t) {
		// --- childrenを持つノード ---
		case 'root':
		case 'blockquote':
		case 'list':
		case 'listItem':
		case 'paragraph':
		case 'heading':
		case 'table':
		case 'tableRow':
		case 'tableCell':
		case 'delete':
		case 'emphasis':
		case 'footnoteDefinition':
		case 'noteAside': // カスタム
		case 'ruby': // カスタム
		case 'styledBlock': // カスタム
			return (
				Array.isArray((node as { children?: unknown }).children) &&
				(node as { children: unknown[] }).children.every(isMdastNode)
			);
		// --- valueを持つノード ---
		case 'text':
		case 'yaml':
		case 'inlineCode':
		case 'code':
		case 'html':
			return (
				typeof (node as { value?: unknown }).value === 'string' &&
				!('children' in node)
			);
		// --- 参照・定義系 ---
		case 'definition':
		case 'footnoteReference':
		case 'image':
		case 'imageReference':
		case 'link':
		case 'linkReference':
			// childrenを持たない場合もあるが、mdast的にはdataや他プロパティで判定可
			return typeof (node as { type: string }).type === 'string';
		// --- GFM/Directive拡張 ---
		case 'break':
		case 'thematicBreak':
		case 'strong':
			// children/valueどちらも持たない
			return true;
		// --- remark-directive拡張ノード ---
		case 'textDirective':
		case 'leafDirective':
		case 'containerDirective':
			// directiveノードはchildren/value/data等柔軟
			return typeof (node as { type: string }).type === 'string';
		default: {
			const _exhaustive: never = t;
			console.warn('Unknown node type:', _exhaustive, node);
			return false;
		}
	}
}

interface CustomMatter {
	styles?: Record<string, React.CSSProperties>;
	[key: string]: unknown;
}

function isCustomMatter(obj: unknown): obj is CustomMatter {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		('styles' in obj
			? typeof (obj as { styles: unknown }).styles === 'object' &&
				(obj as { styles: unknown }).styles !== null &&
				Object.values(
					(obj as { styles: Record<string, unknown> }).styles,
				).every((value) => typeof value === 'object' && value !== null)
			: true)
	);
}

/**
 * 与えられたオブジェクトがmdastのRootノードかどうかを判定する型ガード関数。
 * @param node
 * @returns
 */
function isRootNode(node: unknown): node is Root {
	return isMdastNode(node) && node.type === 'root';
}

function getNodeText(node: Nodes): string {
	if (
		node.type === 'text' ||
		node.type === 'yaml' ||
		node.type === 'inlineCode' ||
		node.type === 'code'
	) {
		return typeof node.value === 'string' ? node.value : '';
	}
	if ('children' in node && Array.isArray(node.children)) {
		return node.children.map(getNodeText).join('');
	}
	return '';
}

function slugify(text: string): string {
	return text
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^-]/g, '')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/^-+|-+$/g, '');
}

function getHeadingId(node: Extract<Nodes, { type: 'heading' }>): string {
	return slugify(getNodeText(node));
}

function convertToMdast(markdown: string) {
	// 1. 同期的に最小限のパースを行う / プラグインも適用してASTを生成
	const ast = processor.runSync(processor.parse(markdown));

	// プラグイン適用後のASTがmdastの構造を満たしているかを厳密にチェック
	if (!isRootNode(ast)) {
		console.error('Parsed AST is not a valid mdast node:', ast);
		throw new Error('Invalid AST structure');
	}

	// 2. Frontmatter の手動抽出
	const yamlNode = ast.children?.find((child) => child.type === 'yaml');
	const matter =
		yamlNode && yamlNode.value
			? (() => {
					try {
						const parsed = yaml.load(yamlNode.value);
						if (!isCustomMatter(parsed)) {
							console.warn(
								'Parsed YAML does not match expected structure:',
								parsed,
							);
							return null;
						}
						return parsed;
					} catch (e) {
						console.error('YAMLのパースに失敗しました', e);
						return null;
					}
				})()
			: null;

	// yamlノード自体はレンダリング不要なので除外
	const filteredAst: Root = {
		...ast,
		children: ast.children?.filter((child) => child.type !== 'yaml'),
	};

	return {
		ast: filteredAst,
		matter,
	};
}

type PANE = 'LEFT' | 'RIGHT' | 'DOUBLE';

type RenderMeta = [React.ReactNode, number, PANE];
function renderChild(child: Nodes): React.ReactNode[] {
	return renderNodeWithMeta(child).map(
		([content, _gridRow, _pane]) => content,
	);
}
function renderNodeWithMeta(node: Nodes): RenderMeta[] {
	const rows: RenderMeta[] = (() => {
		switch (node.type) {
			case 'root':
				return node.children
					?.map((child) => renderNodeWithMeta(child))
					.flat();
			case 'paragraph': {
				const { gridRow = 0 } = node.data ?? {};
				const Paragraph = (
					<Typography
						variant="body1"
						key={`paragraph-${node.position?.start?.offset}`}
					>
						{node.children?.map((child, i) => (
							<React.Fragment
								key={`paragraph-child-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
					</Typography>
				);
				return [[Paragraph, gridRow, 'LEFT']];
			}
			case 'text':
				return [[node.value, 0, 'LEFT']];
			case 'heading': {
				const { gridRow = 0 } = node.data ?? {};
				const headingId = getHeadingId(node);
				const Heading = (
					<Typography
						component={`h${node.depth}`}
						variant={`h${node.depth}`}
						id={headingId}
						key={`heading-${node.position?.start?.offset}`}
					>
						{node.children?.map((child, i) => (
							<React.Fragment
								key={`heading-child-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
					</Typography>
				);
				return [[Heading, gridRow, 'DOUBLE']];
			}
			case 'noteAside': {
				const { gridRow = 0 } = node.data ?? {};
				const NoteAsideContent = (
					<React.Fragment
						key={`note-aside-${node.position?.start?.offset}`}
					>
						{'children' in node &&
							node.children?.map((child, i) => (
								<React.Fragment
									key={`note-aside-child-${node.position?.start?.offset}-${i}`}
								>
									{renderChild(child)}
								</React.Fragment>
							))}
					</React.Fragment>
				);
				return [[NoteAsideContent, gridRow, 'RIGHT']];
			}
			case 'ruby': {
				const start = node.position?.start?.offset ?? 0;
				const { rubyText } = node.data;
				const RubyContent = (
					<ruby key={`ruby-${start}`}>
						<React.Fragment>
							{node.children?.map((child, i) => (
								<React.Fragment key={`ruby-text-${start}-${i}`}>
									{renderChild(child)}
								</React.Fragment>
							))}
						</React.Fragment>
						<rp>(</rp>
						<rt>{rubyText}</rt>
						<rp>)</rp>
					</ruby>
				);
				return [[RubyContent, 0, 'LEFT']];
			}
			case 'styledBlock': {
				const { styleName } = node.data;
				const StyledBlockContent = (
					<Typography
						className={styleName}
						component="span"
						variant="inherit"
						key={`styled-block-${node.position?.start?.offset}`}
					>
						{'children' in node &&
							node.children?.map((child, i) => (
								<React.Fragment
									key={`styled-block-child-${node.position?.start?.offset}-${i}`}
								>
									{renderChild(child)}
								</React.Fragment>
							))}
					</Typography>
				);
				return [[StyledBlockContent, 0, 'LEFT']];
			}
			case 'html': {
				const { gridRow = 0 } = node.data ?? {};
				// HTMLとしてはレンダリングせずテキストとして表示
				const HtmlContent = (
					<Typography
						component="span"
						variant="body1"
						key={`html-${node.position?.start?.offset}`}
					>
						{node.value}
					</Typography>
				);
				return [[HtmlContent, gridRow, 'LEFT']];
			}
			case 'link': {
				const { url, title } = node;
				const isInternalAnchor =
					typeof url === 'string' && url.startsWith('#');
				const LinkMain = () => (
					<Link
						href={url}
						component="a"
						{...(!isInternalAnchor
							? { target: '_blank', rel: 'noopener noreferrer' }
							: {})}
						key={`link-${node.position?.start?.offset}`}
					>
						{node.children?.map((child, i) => (
							<React.Fragment
								key={`link-child-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
					</Link>
				);
				const LinkContent = title ? (
					<Tooltip
						title={title}
						key={`link-tooltip-${node.position?.start?.offset}`}
					>
						<LinkMain
							key={`link-main-${node.position?.start?.offset}`}
						/>
					</Tooltip>
				) : (
					<LinkMain
						key={`link-main-${node.position?.start?.offset}`}
					/>
				);
				return [[LinkContent, 0, 'LEFT']];
			}
			case 'thematicBreak': {
				const { gridRow = 0 } = node.data ?? {};
				const HR = (
					<Divider
						key={`thematicBreak-${node.position?.start?.offset}`}
						sx={{ my: 2 }}
					/>
				);
				return [[HR, gridRow, 'DOUBLE']];
			}

			case 'list': {
				const { gridRow = 0 } = node.data ?? {};
				const ListContent = (
					<Box
						component={node.ordered ? 'ol' : 'ul'}
						key={`list-${node.position?.start?.offset}`}
						sx={{
							pl: 3,
							mb: 2,
							mt: 1,
						}}
					>
						{node.children?.map((child, i) => (
							<React.Fragment
								key={`list-child-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
					</Box>
				);
				return [[ListContent, gridRow, 'LEFT']];
			}
			case 'listItem': {
				const { gridRow = 0 } = node.data ?? {};
				const nestedLists = (node.children ?? []).filter(
					(child) => child.type === 'list',
				);
				const inlineChildren = (node.children ?? []).filter(
					(child) => child.type !== 'list',
				);
				const ListItemContent = (
					<Box
						component="li"
						key={`list-item-${node.position?.start?.offset}`}
						sx={{
							mb: 0.75,
							lineHeight: 1.5,
							'& > ol, & > ul': {
								pl: 3,
								mb: 0,
							},
						}}
					>
						{inlineChildren.map((child, i) => (
							<React.Fragment
								key={`list-item-child-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
						{nestedLists.map((nested, i) => (
							<React.Fragment
								key={`list-item-nested-list-${nested.position?.start?.offset}-${i}`}
							>
								{renderChild(nested)}
							</React.Fragment>
						))}
					</Box>
				);
				return [[ListItemContent, gridRow, 'LEFT']];
			}

			case 'yaml': {
				return [];
			}
			case 'inlineCode': {
				return [
					[
						<Box
							component="code"
							key={`inlineCode-${node.position?.start?.offset}`}
							sx={{
								fontFamily: 'Monospace',
								backgroundColor: 'rgba(0,0,0,0.06)',
								px: '0.25rem',
								borderRadius: '0.25rem',
							}}
						>
							{node.value}
						</Box>,
						0,
						'LEFT',
					],
				];
			}

			case 'code': {
				const { gridRow = 0 } = node.data ?? {};
				console.info(`code block: ${node?.lang}`);
				return [
					[
						<ShikiCodeBlock
							key={`code-${node.position?.start?.offset}`}
							code={node.value}
							lang={node.lang}
						/>,
						gridRow,
						'LEFT',
					],
				];
			}

			case 'break': {
				return [
					[
						<br key={`break-${node.position?.start?.offset}`} />,
						0,
						'LEFT',
					],
				];
			}
			case 'delete': {
				return [
					[
						<del key={`delete-${node.position?.start?.offset}`}>
							{node.children?.map((child, i) => (
								<React.Fragment
									key={`delete-child-${node.position?.start?.offset}-${i}`}
								>
									{renderChild(child)}
								</React.Fragment>
							))}
						</del>,
						0,
						'LEFT',
					],
				];
			}
			case 'emphasis': {
				return [
					[
						<em key={`emphasis-${node.position?.start?.offset}`}>
							{node.children?.map((child, i) => (
								<React.Fragment
									key={`emphasis-child-${node.position?.start?.offset}-${i}`}
								>
									{renderChild(child)}
								</React.Fragment>
							))}
						</em>,
						0,
						'LEFT',
					],
				];
			}
			case 'footnoteDefinition': {
				return [];
			}
			case 'strong': {
				return [
					[
						<strong key={`strong-${node.position?.start?.offset}`}>
							{node.children?.map((child, i) => (
								<React.Fragment
									key={`strong-child-${node.position?.start?.offset}-${i}`}
								>
									{renderChild(child)}
								</React.Fragment>
							))}
						</strong>,
						0,
						'LEFT',
					],
				];
			}
			case 'blockquote': {
				const { gridRow = 0 } = node.data ?? {};
				const Quote = (
					<Box
						component="blockquote"
						key={`blockquote-${node.position?.start?.offset}`}
						sx={{
							pl: '1rem',
							borderLeft: '4px solid',
							borderColor: 'divider',
							color: 'text.secondary',
							m: 0,
						}}
					>
						{node.children?.map((child, i) => (
							<React.Fragment
								key={`blockquote-child-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
					</Box>
				);
				return [[Quote, gridRow, 'LEFT']];
			}
			case 'table': {
				const { gridRow = 0 } = node.data ?? {};
				return [
					[
						<SortableMarkdownTable
							key={`sortable-table-${node.position?.start?.offset}`}
							table={node}
							renderChild={renderChild}
						/>,
						gridRow,
						'LEFT',
					],
				];
			}
			case 'tableRow': {
				const RowContent = (
					<Box
						component="tr"
						key={`tableRow-${node.position?.start?.offset}`}
					>
						{node.children?.map((child, i) => (
							<React.Fragment
								key={`tableCell-wrapper-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
					</Box>
				);
				return [[RowContent, 0, 'LEFT']];
			}
			case 'tableCell': {
				const align =
					(node as { align?: 'left' | 'center' | 'right' | null })
						.align ?? 'left';
				const isHeader =
					(node as { isHeader?: boolean }).isHeader === true;
				const CellContent = (
					<Box
						component={isHeader ? 'th' : 'td'}
						key={`tableCell-${node.position?.start?.offset}`}
						sx={{
							border: '1px solid',
							borderColor: 'divider',
							p: 1,
							textAlign: align,
						}}
					>
						{node.children?.map((child, i) => (
							<React.Fragment
								key={`tableCell-child-${node.position?.start?.offset}-${i}`}
							>
								{renderChild(child)}
							</React.Fragment>
						))}
					</Box>
				);
				return [[CellContent, 0, 'LEFT']];
			}
			case 'definition': {
				return [];
			}
			case 'footnoteReference': {
				return [
					[
						<Box
							component="sup"
							key={`footnoteReference-${node.position?.start?.offset}`}
							sx={{ fontSize: '0.75rem' }}
						>
							{node.identifier || node.label || 'fn'}
						</Box>,
						0,
						'LEFT',
					],
				];
			}
			case 'image': {
				return [
					[
						<Box
							component="img"
							src={node.url}
							alt={node.alt ?? ''}
							title={node.title ?? undefined}
							key={`image-${node.position?.start?.offset}`}
							sx={{
								maxWidth: '100%',
								height: 'auto',
								display: 'block',
							}}
						/>,
						0,
						'LEFT',
					],
				];
			}
			case 'imageReference': {
				return [
					[
						<Box
							component="span"
							key={`imageReference-${node.position?.start?.offset}`}
							sx={{ fontStyle: 'italic' }}
						>
							{node.alt ?? `[image:${node.identifier}]`}
						</Box>,
						0,
						'LEFT',
					],
				];
			}
			case 'linkReference': {
				return [
					[
						<Link
							component="span"
							key={`linkReference-${node.position?.start?.offset}`}
							sx={{
								textDecoration: 'underline',
								cursor: 'pointer',
							}}
						>
							{node.children?.map((child, i) => (
								<React.Fragment
									key={`linkReference-child-${node.position?.start?.offset}-${i}`}
								>
									{renderChild(child)}
								</React.Fragment>
							))}
						</Link>,
						0,
						'LEFT',
					],
				];
			}

			case 'textDirective':
			case 'leafDirective':
			case 'containerDirective': {
				console.warn('Unsupported node type:', node.type, node);
				const UnknownContent = (
					<React.Fragment
						key={`unknown-${node.position?.start?.offset}`}
					>
						{`[Unsupported node type: ${node.type}]`}
						{'children' in node &&
							node.children?.map((child, i) => (
								<React.Fragment
									key={`unknown-child-${node.position?.start?.offset}-${i}`}
								>
									{renderChild(child)}
								</React.Fragment>
							))}
					</React.Fragment>
				);
				return [[UnknownContent, 0, 'LEFT']];
			}
			default: {
				const _exhaustive: never = node;
				console.warn(
					'Unknown node type:',
					(_exhaustive as Nodes).type,
					_exhaustive,
				);
				return [] as RenderMeta[];
			}
		}
	})();

	return rows;
}

function paneToGridColumn(pane: PANE): string {
	switch (pane) {
		case 'LEFT':
			return '1';
		case 'RIGHT':
			return '2';
		case 'DOUBLE':
			return '1 / span 2';
		default: {
			const _exhaustive: never = pane;
			console.warn('Unknown pane type:', _exhaustive);
			return '1';
		}
	}
}

function renderNode(node: Nodes): React.ReactNode {
	const rows = renderNodeWithMeta(node);
	// paneで振り分ける必要あり
	return (
		<React.Fragment>
			{rows
				.reduce<[React.ReactNode[], number]>(
					([acc, gridRowIndex], [content, gridRow, pane], _ix) => {
						return [
							[
								...acc,
								<Box
									key={`box-${gridRowIndex}`}
									sx={{
										gridRow,
										gridColumn: paneToGridColumn(pane),
									}}
								>
									{content}
								</Box>,
							],
							gridRowIndex + 1,
						];
					},
					[[], 1] as const,
				)[0]
				.map((child, i) => (
					<React.Fragment key={i}>{child}</React.Fragment>
				))}
		</React.Fragment>
	);
}

function MdastRenderer({
	ast,
}: {
	ast: ReturnType<typeof convertToMdast>['ast'];
}) {
	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: '3fr 1fr',
				'& h1': {
					fontSize: '2.5rem',
				},
				'& h2': {
					fontSize: '2rem',
				},
				'& h3': {
					fontSize: '1.75rem',
				},
				'& h4': {
					fontSize: '1.5rem',
				},
				'& h5': {
					fontSize: '1.375rem',
				},
				'& h6': {
					fontSize: '1.25rem',
				},
			}}
		>
			{renderNode(ast)}
		</Box>
	);
}

export interface CustomMatterProcessorProps {
	matter: ReturnType<typeof convertToMdast>['matter'];
}

export function CustomMatterProcessor({ matter }: CustomMatterProcessorProps) {
	if (!matter) return null;
	if (!matter.styles) return null;

	const styles = Object.entries(matter.styles).map(([className, style]) => {
		const cssString = Object.entries(style)
			.map(([key, value]) => {
				const kebabKey = key.replace(
					/[A-Z]/g,
					(match) => `-${match.toLowerCase()}`,
				);
				return `${kebabKey}: ${value};`;
			})
			.join(' ');

		return (
			<style key={className}>{`.${className} { ${cssString} }`}</style>
		);
	});

	return <Helmet>{styles}</Helmet>;
}

/**
 * Markdown本文＋注釈ペインを左右分割で表示する。
 * 注釈は独自記法で抽出し、右ペインに表示。
 */
export function MarkdownViewerPane({
	visible,
	markdown,
}: MarkdownViewerPaneProps) {
	if (!visible) return null;

	const { ast, matter } = convertToMdast(markdown);

	return (
		<React.Fragment>
			<CustomMatterProcessor matter={matter} />
			<ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
				<MdastRenderer ast={ast} />
			</ErrorBoundary>
		</React.Fragment>
	);
}
