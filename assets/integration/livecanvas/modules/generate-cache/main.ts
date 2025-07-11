/**
 * @module generate-cache 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { createGenerateCacheModule } from '@/integration/shared/modules/generate-cache';

// Custom save detector for LiveCanvas
function livecanvasSaveActionDetector(url: string, payload: any, response?: any) {
  if (url.includes('admin-ajax.php') && response?.responseText === 'Save') {
    return true;
  }
  return false;
}

createGenerateCacheModule({
  builderName: 'livecanvas',
  saveActionDetector: livecanvasSaveActionDetector,
  usesXMLHttpRequest: true,
});