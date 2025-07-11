/**
 * @module generate-cache 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { createGenerateCacheModule } from '@/integration/shared/modules/generate-cache';
import { getSaveActionDetector, getBuilderSpecificConfig } from '@/integration/bricks/utils/builder-config.js';
import { settingsState } from '@/integration/bricks/constant';

const builderConfig = getBuilderSpecificConfig();

createGenerateCacheModule({
  builderName: 'bricks',
  saveActionDetector: getSaveActionDetector(),
  usesXMLHttpRequest: builderConfig.usesXMLHttpRequest,
  settingsCheck: () => settingsState('module.generate-cache.on-save', true).value,
});