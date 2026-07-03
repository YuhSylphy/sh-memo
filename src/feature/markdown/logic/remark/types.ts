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

	export interface ListData extends Data {
		gridRow: number;
	}

	export interface ListItemData extends Data {
		gridRow: number;
	}

	export interface CodeData extends Data {
		gridRow: number;
	}

	export interface BlockquoteData extends Data {
		gridRow: number;
	}

	export interface TableData extends Data {
		gridRow: number;
	}

	export interface ThematicBreakData extends Data {
		gridRow: number;
	}

	export interface HtmlData extends Data {
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
		/** null のとき親スタイルをリセット（className なし） */
		data: Data & { styleName: string | null };
		children: Nodes[];
	}

	/**
	 * 折りたたみブロックノード
	 */
	export interface CollapseBlock extends Node {
		type: 'collapseBlock';
		data: Data & {
			gridRow: number;
			/** collapseBlock 直下の最初の子ノードに割り当てられた gridRow */
			childGridRowStart: number;
			/** 常時表示するラベル（インラインノード列）。後続プラグインで変換済み */
			label: Nodes[];
			/** true のとき初期状態で展開 */
			defaultOpen: boolean;
		};
		children: Nodes[];
	}

	interface RootContentMap {
		noteAside: NoteAside;
		ruby: Ruby;
		styledBlock: StyledBlock;
		collapseBlock: CollapseBlock;
	}

	interface BlockContentMap {
		noteAside: NoteAside;
		styledBlock: StyledBlock;
		collapseBlock: CollapseBlock;
	}

	interface PhrasingContentMap {
		ruby: Ruby;
		styledBlock: StyledBlock;
	}
}
