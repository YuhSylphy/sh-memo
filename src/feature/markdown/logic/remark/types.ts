/**
 * AST拡張ノード型定義
 */

declare module 'mdast' {
	/**
	 * 右ペイン注釈ノード
	 */
	export interface NoteAside extends Node {
		type: 'noteAside';
		data: Data & { gridRow: number };
		children: Nodes[];
	}

	export interface ParagraphData extends Data {
		gridRow: number;
	}

	export interface HeadingData extends Data {
		gridRow: number;
	}

	export interface ThematicBreakData extends Data {
		gridRow: number;
	}

	/**
	 * ルビ付きテキストノード
	 */
	export interface Ruby extends Node {
		type: 'ruby';
		data: Data & { rubyText: string };
		children: Nodes[];
	}

	/**
	 * スタイル指定ノード
	 */
	export interface StyledBlock extends Node {
		type: 'styledBlock';
		data: Data & { styleName: string };
		children: Nodes[];
	}

	interface RootContentMap {
		noteAside: NoteAside;
		ruby: Ruby;
		styledBlock: StyledBlock;
	}

	interface BlockContentMap {
		noteAside: NoteAside;
		styledBlock: StyledBlock;
	}

	interface PhrasingContentMap {
		ruby: Ruby;
		styledBlock: StyledBlock;
	}
}
