import { addStoreEpic } from '../../core/store';
import { counterEpic } from './state/counterEpic';

// Side effect: register the counter epic when this module is loaded
addStoreEpic(counterEpic);

export { CounterPanel } from './components/CounterPanel';
export { Sample } from './components/Sample';
