/* eslint-disable */
import objectFitImages from './vendor/ofi.es-modules';
import addUtils from './modules/utils';
import getScrollTop from './global/getscrolltop';
import responsive from './global/responsive';
import state from './global/state';
/* eslint-enable */

addUtils();
getScrollTop();
responsive();
state();

if (objectFitImages) {
  objectFitImages();
}
