/**
 * @module generate-cache 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { createGenerateCacheModule } from '@/integration/shared/modules/generate-cache';

// Custom save detector for Builderius
function builderiusSaveActionDetector(url: string, payload: any) {
  if (url.includes('v2/builderius') && payload) {
    return payload.commit_entity?.errors?.length === 0 || payload.commit_global?.errors?.length === 0;
  }
  return false;
}

createGenerateCacheModule({
  builderName: 'builderius',
  saveActionDetector: builderiusSaveActionDetector,
  usesXMLHttpRequest: true,
});