/**
 * @module shared/utils/builder-configs
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Builder configuration utilities
 */

export interface BuilderConfig {
  appId: string;
  storagePrefix: string;
  version: string;
  iframe: HTMLIFrameElement;
  rootElement?: Element;
  hasCustomUnit?: boolean;
  hasThemeDetection?: boolean;
  themeDetectionTarget?: string;
}

export function createBuilderConfig(config: Partial<BuilderConfig>): BuilderConfig {
  return {
    appId: config.appId || 'windpress-variable-app',
    storagePrefix: config.storagePrefix || 'windpress-variable-app',
    version: config.version || '1.0.0',
    iframe: config.iframe!,
    rootElement: config.rootElement,
    hasCustomUnit: config.hasCustomUnit || false,
    hasThemeDetection: config.hasThemeDetection || false,
    themeDetectionTarget: config.themeDetectionTarget || 'body',
  };
}

export function getSaveActionDetector(builderName: string): (url: string, payload: any) => boolean {
  const detectors: Record<string, (url: string, payload: any) => boolean> = {
    breakdance: (url: string, payload: any) => {
      return new URL(url).searchParams.get('_breakdance_doing_ajax') === 'yes' && payload.action === 'breakdance_save';
    },
    bricks: (_url: string, payload: any) => {
      // For Bricks, payload comes from response.data in XMLHttpRequest
      return payload && payload.action === 'bricks_save_post';
    },
    builderius: (url: string, payload: any) => {
      return url.includes('wp-admin/admin-ajax.php') && payload.action === 'builderius_save_post';
    },
    oxygen: (url: string, payload: any) => {
      return url.includes('wp-admin/admin-ajax.php') && payload.action === 'ct_save_post';
    },
    livecanvas: (url: string, payload: any) => {
      return url.includes('wp-admin/admin-ajax.php') && payload.action === 'livecanvas_save_post';
    },
  };

  return detectors[builderName] || (() => false);
}

export function getBuilderSpecificConfig(builderName: string): { usesXMLHttpRequest?: boolean } {
  const configs: Record<string, { usesXMLHttpRequest?: boolean }> = {
    breakdance: { usesXMLHttpRequest: false },
    bricks: { usesXMLHttpRequest: true },
    builderius: { usesXMLHttpRequest: false },
    oxygen: { usesXMLHttpRequest: false },
    livecanvas: { usesXMLHttpRequest: false },
  };

  return configs[builderName] || { usesXMLHttpRequest: false };
}