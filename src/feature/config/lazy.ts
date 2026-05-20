import { addStoreEpic } from '../../core/store';
import { configEpic } from './state/configEpic';

// Side effect: register the config epic when this module is loaded.
addStoreEpic(configEpic);

export { ConfigForm } from './components/ConfigForm';
