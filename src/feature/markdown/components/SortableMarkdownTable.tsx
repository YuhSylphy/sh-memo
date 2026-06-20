import React from 'react';

import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	type TableCellProps,
} from '@mui/material';
import type { Nodes } from 'mdast';

/**
 * 指定ノード配下のテキストを再帰的に取得します。
 * テーブルのソートキー生成に利用します。
 */
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

function descendingComparator(
	a: { text: string }[],
	b: { text: string }[],
	orderBy: number,
) {
	if (a[orderBy].text < b[orderBy].text) {
		return -1;
	}
	if (a[orderBy].text > b[orderBy].text) {
		return 1;
	}
	return 0;
}

function getComparator(
	order: 'asc' | 'desc',
	orderBy: number,
): (a: { text: string }[], b: { text: string }[]) => number {
	return order === 'desc'
		? (a, b) => descendingComparator(b, a, orderBy)
		: (a, b) => descendingComparator(a, b, orderBy);
}

type TableCellNode = Extract<Nodes, { type: 'tableCell' }>;

function stableSort(
	array: Array<{ text: string; cell: TableCellNode }[]>,
	comparator: (a: { text: string }[], b: { text: string }[]) => number,
) {
	const stabilizedThis = array.map((el, index) => [el, index] as const);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) {
			return order;
		}
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

export function SortableMarkdownTable({
	table,
	renderChild,
}: {
	table: Extract<Nodes, { type: 'table' }>;
	renderChild: (child: Nodes) => React.ReactNode[];
}) {
	const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
	const [orderBy, setOrderBy] = React.useState(0);
	const rows = React.useMemo(() => {
		const bodyRows = table.children?.slice(1) ?? [];
		return bodyRows.map((row) =>
			(row as Extract<Nodes, { type: 'tableRow' }>).children.map(
				(cell) => ({
					text: getNodeText(cell),
					cell: cell as Extract<Nodes, { type: 'tableCell' }>,
				}),
			),
		);
	}, [table]);

	const headerRow = table.children?.[0] as
		| Extract<Nodes, { type: 'tableRow' }>
		| undefined;
	const getHeaderAlign = (index: number): TableCellProps['align'] => {
		const align = table.align?.[index];
		return align === 'center' || align === 'right' ? align : 'left';
	};
	const headers =
		headerRow?.children.map((cell, index) => ({
			label: getNodeText(cell),
			align: getHeaderAlign(index),
		})) ?? [];

	const sortedRows = React.useMemo(
		() => stableSort(rows, getComparator(order, orderBy)),
		[rows, order, orderBy],
	);

	const handleRequestSort = (property: number) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	return (
		<TableContainer component={Paper} sx={{ mb: 2 }}>
			<Table size="small">
				<TableHead>
					<TableRow>
						{headers.map((header, index) => (
							<TableCell
								key={`header-${index}`}
								align={header.align}
							>
								<TableSortLabel
									active={orderBy === index}
									direction={
										orderBy === index ? order : 'asc'
									}
									onClick={() => handleRequestSort(index)}
								>
									{header.label}
								</TableSortLabel>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{sortedRows.map((row, rowIndex) => (
						<TableRow key={`body-row-${rowIndex}`}>
							{row.map((cell, cellIndex) => (
								<TableCell
									key={`body-cell-${rowIndex}-${cellIndex}`}
									align={headers[cellIndex]?.align ?? 'left'}
								>
									{(cell.cell.children ?? []).map(
										(child, i) => (
											<React.Fragment
												key={`body-cell-child-${rowIndex}-${cellIndex}-${i}`}
											>
												{renderChild(child)}
											</React.Fragment>
										),
									)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
