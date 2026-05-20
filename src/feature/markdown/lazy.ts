import { addStoreEpic } from '../../core/store';
import { markdownEpic } from './state/markdownEpic';

// Side effect: register the markdown epic when this module is loaded.
addStoreEpic(markdownEpic);

export { MarkdownRenderer } from './components/MarkdownRenderer';
