import type { AddEpic } from '../../core/store';

let isCounterFeatureRegistered = false;

export const registerCounterFeature = async (addEpic: AddEpic) => {
	if (isCounterFeatureRegistered) {
		return;
	}

	const { counterEpic } = await import('./state/counterEpic');
	addEpic(counterEpic);
	isCounterFeatureRegistered = true;
};