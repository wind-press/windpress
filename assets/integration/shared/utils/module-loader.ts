/**
 * @module shared/utils/module-loader
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Shared module loading utilities for page builder integrations
 */

// @ts-ignore
import { logger } from '@/integration/common/logger';

export interface ModuleSet {
  core: (() => Promise<any>)[];
  tailwindV4?: (() => Promise<any>)[];
  conditional?: Array<{
    condition: () => boolean;
    modules: (() => Promise<any>)[];
  }>;
}

export async function createStandardLoader(
  builderName: string,
  waitForCondition: () => Promise<boolean>,
  modules: ModuleSet
): Promise<void> {
  logger(`Loading ${builderName} modules...`);
  
  // Wait for builder to be ready
  await waitForCondition();
  
  // Load core modules
  for (const moduleLoader of modules.core) {
    try {
      await moduleLoader();
    } catch (error) {
      console.error(`Failed to load core module:`, error);
    }
  }
  
  // Load Tailwind v4 modules if applicable
  if (modules.tailwindV4) {
    const iframe = getBuilderIframe(builderName);
    if (iframe && Number((iframe.contentWindow as any)?.windpress?._tailwindcss_version) === 4) {
      for (const moduleLoader of modules.tailwindV4) {
        try {
          await moduleLoader();
        } catch (error) {
          console.error(`Failed to load Tailwind v4 module:`, error);
        }
      }
    }
  }
  
  // Load conditional modules
  if (modules.conditional) {
    for (const conditional of modules.conditional) {
      if (conditional.condition()) {
        for (const moduleLoader of conditional.modules) {
          try {
            await moduleLoader();
          } catch (error) {
            console.error(`Failed to load conditional module:`, error);
          }
        }
      }
    }
  }
  
  logger(`${builderName} modules loaded!`);
}

function getBuilderIframe(builderName: string): HTMLIFrameElement | null {
  const iframeSelectors: Record<string, string> = {
    breakdance: '#app #iframe',
    bricks: '#bricks-builder-iframe',
    oxygen: '#ct-artificial-viewport',
    builderius: '#builderius-iframe',
    livecanvas: '#livecanvas-iframe'
  };
  
  const selector = iframeSelectors[builderName];
  return selector ? document.querySelector(selector) : null;
}

export async function waitForCondition(condition: () => boolean, timeout = 30000): Promise<boolean> {
  const start = Date.now();
  
  while (!condition() && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return condition();
}