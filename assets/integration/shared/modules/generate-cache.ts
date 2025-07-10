/**
 * @module generate-cache 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { logger } from '@/integration/common/logger';
import type { BuildCacheOptions } from '@/packages/core/windpress/compiler';

interface GenerateCacheConfig {
  builderName: string;
  saveActionDetector: (url: string, payload: any) => boolean;
  usesXMLHttpRequest?: boolean;
  settingsCheck?: () => boolean;
}

export function createGenerateCacheModule(config: GenerateCacheConfig) {
  const channel = new BroadcastChannel('windpress');

  function sendCacheGenerationMessage() {
    channel.postMessage({
      task: 'generate-cache',
      source: 'windpress/integration',
      target: 'windpress/compiler',
      data: {
        kind: 'incremental',
        incremental: {
          providers: [
            config.builderName,
          ]
        }
      } as BuildCacheOptions
    });
  }

  if (config.usesXMLHttpRequest) {
    // XMLHttpRequest approach for builders like Bricks
    (function () {
      const __xhr = window.XMLHttpRequest;
      function XMLHttpRequest() {
        const xhr = new __xhr();

        if (config.settingsCheck && !config.settingsCheck()) {
          return xhr;
        }

        const open = xhr.open;
        xhr.open = function (method, url) {
          if (method === 'POST' && String(url).includes('admin-ajax.php')) {
            const onreadystatechange = xhr.onreadystatechange;

            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  if (config.saveActionDetector(String(url), response.data || {})) {
                    sendCacheGenerationMessage();
                  }
                } catch (e) {
                  // Ignore JSON parse errors
                }
              }

              if (onreadystatechange) {
                onreadystatechange.call(this);
              }
            };
          }

          open.apply(this, [method, url]);
        }

        return xhr;
      }

      (window as any).XMLHttpRequest = XMLHttpRequest;
    }());
  } else {
    // Fetch approach for builders like Breakdance
    (function () {
      const { fetch: originalFetch } = window;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);

        if (response.ok && response.status === 200) {
          const url = args[0] as string;
          const payload = args[1]?.body && args[1].body instanceof FormData ? Object.fromEntries(args[1].body.entries()) : {};
          
          if (config.saveActionDetector(url, payload)) {
            sendCacheGenerationMessage();
          }
        }

        return response;
      };
    }());
  }

  logger('Module loaded!', { module: 'generate-cache', builder: config.builderName });
}