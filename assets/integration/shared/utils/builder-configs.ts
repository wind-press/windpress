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

