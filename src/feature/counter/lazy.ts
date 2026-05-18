import { addStoreEpic } from '../../core/store';
import { counterEpic } from './state/counterEpic';

// Side effect: register the counter epic when this module is loaded
addStoreEpic(counterEpic);

export { default as CounterPanel } from './components/CounterPanel';
