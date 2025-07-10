/**
 * @module generate-cache 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { createGenerateCacheModule } from '@/integration/shared/modules/generate-cache';
import { getSaveActionDetector } from '@/integration/shared/utils/builder-configs';

createGenerateCacheModule({
  builderName: 'breakdance',
  saveActionDetector: getSaveActionDetector('breakdance'),
});