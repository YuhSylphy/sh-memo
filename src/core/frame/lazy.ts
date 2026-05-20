import { addStoreEpic } from '../../core/store';
import { frameEpic } from './state/frameEpic';

// Side effect: register the frame epic when this module is loaded.
addStoreEpic(frameEpic);

export { MainFrame } from './components/MainFrame';
