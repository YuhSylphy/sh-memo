export type DynamicMenuDef = {
	id: string;
	title: string;
	icon?: string;
	path?: string;
	children?: DynamicMenuDef[];
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function isDynamicMenuDef(value: unknown): value is DynamicMenuDef {
	if (!isObjectRecord(value)) {
		return false;
	}

	if (typeof value.id !== 'string') {
		return false;
	}

	if (typeof value.title !== 'string') {
		return false;
	}

	if (value.icon !== undefined && typeof value.icon !== 'string') {
		return false;
	}

	if (value.path !== undefined && typeof value.path !== 'string') {
		return false;
	}

	if (value.children !== undefined) {
		if (!Array.isArray(value.children)) {
			return false;
		}
		if (!value.children.every(isDynamicMenuDef)) {
			return false;
		}
	}

	return true;
}

export function isDynamicMenuDefTree(
	value: unknown,
): value is DynamicMenuDef[] {
	return Array.isArray(value) && value.every(isDynamicMenuDef);
}
