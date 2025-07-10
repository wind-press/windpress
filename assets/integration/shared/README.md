# WindPress Shared Integration Components

This directory contains shared components, modules, and utilities used across multiple page builder integrations in WindPress.

## Directory Structure

```
shared/
├── components/
│   └── variable-picker/           # Shared Vue components for variable picker
│       ├── ColorVariableItems.vue
│       ├── CommonVariableItems.vue
│       ├── ExpansionPanel.vue
│       ├── PanelBody.vue
│       └── PanelHeader.vue
├── modules/
│   └── generate-cache.ts          # Unified cache generation module
├── styles/
│   ├── _variables.scss            # Shared SCSS variables
│   ├── _mixins.scss              # Shared SCSS mixins
│   └── variable-picker.scss      # Variable picker component styles
└── utils/
    ├── builder-configs.ts         # Builder configuration utilities
    ├── dom-observer.ts           # DOM observation helpers
    ├── element-helpers.ts        # Element manipulation utilities
    ├── module-loader.ts          # Shared module loading utilities
    └── index.ts                  # Barrel export file
```

## Usage

### Using Shared Components

```vue
<script setup>
import PanelHeader from '@/integration/shared/components/variable-picker/PanelHeader.vue';
import PanelBody from '@/integration/shared/components/variable-picker/PanelBody.vue';
import { createBuilderConfig } from '@/integration/shared/utils/builder-configs';

const builderConfig = createBuilderConfig({
  appId: 'my-builder-variable-app',
  storagePrefix: 'my-builder-app',
  version: '1.0.0',
  iframe: myBuilderIframe,
  hasCustomUnit: true,
});
</script>

<template>
  <div>
    <PanelHeader :builder-config="builderConfig" />
    <PanelBody :builder-config="builderConfig" />
  </div>
</template>
```

### Using Shared Modules

```typescript
import { createGenerateCacheModule } from '@/integration/shared/modules/generate-cache';
import { getSaveActionDetector, getBuilderSpecificConfig } from '@/integration/shared/utils/builder-configs';
import { loadModules, waitForCondition } from '@/integration/shared/utils/module-loader';

// Using the module loader
await loadModules({
  builderName: 'my-builder',
  waitForCondition: async () => {
    return await waitForCondition(() => !!document.querySelector('.my-builder-ready'));
  },
  modules: {
    core: ['./modules/settings/main'],
    tailwindV4: ['./modules/variables/main']
  }
});

// Using individual modules
const builderConfig = getBuilderSpecificConfig('my-builder');
createGenerateCacheModule({
  builderName: 'my-builder',
  saveActionDetector: getSaveActionDetector('my-builder'),
  usesXMLHttpRequest: builderConfig.usesXMLHttpRequest,
});
```

### Using Shared Utilities

```typescript
import { observe, waitForElement } from '@/integration/shared/utils/dom-observer';
import { getActiveElement, focusElement } from '@/integration/shared/utils/element-helpers';

// Wait for an element to appear
const element = await waitForElement('.my-selector');

// Observe DOM changes
const observer = observe(document.body, (mutations) => {
  // Handle mutations
});

// Focus management
const activeEl = getActiveElement();
focusElement(myInput);
```

### Using Shared Styles

```scss
@import '@/integration/shared/styles/variables';
@import '@/integration/shared/styles/mixins';

.my-component {
  @include button-primary;
  padding: $wp-spacing-md;
  border-radius: $wp-radius-sm;
}
```

## Builder Configuration

The `createBuilderConfig` function standardizes configuration across different page builders:

```typescript
interface BuilderConfig {
  appId: string;                    // Unique app identifier
  storagePrefix: string;            // Local storage prefix for settings
  version: string;                  // Builder version for display
  iframe: HTMLIFrameElement;        // Builder iframe reference
  rootElement?: Element;            // Root element for drag functionality
  hasCustomUnit?: boolean;          // Whether builder supports custom units
  hasThemeDetection?: boolean;      // Whether to detect theme changes
  themeDetectionTarget?: string;    // Element to observe for theme changes
}
```

## Supported Page Builders

The shared modules currently support:

- **Breakdance**: Uses fetch API, supports custom units, has theme detection
- **Bricks**: Uses XMLHttpRequest, supports settings checks
- **Builderius**: Uses fetch API
- **Oxygen Classic**: Uses fetch API, supports custom units
- **LiveCanvas**: Uses fetch API

## Migration Guide

When migrating an existing integration to use shared components:

1. **Replace component imports**:
   ```vue
   // Before
   import PanelHeader from './components/PanelHeader.vue';
   
   // After
   import PanelHeader from '@/integration/shared/components/variable-picker/PanelHeader.vue';
   ```

2. **Update component props**:
   ```vue
   // Before
   <PanelHeader />
   
   // After
   <PanelHeader :builder-config="builderConfig" />
   ```

3. **Replace module implementations**:
   ```typescript
   // Before: Custom generate-cache implementation
   
   // After
   import { createGenerateCacheModule } from '@/integration/shared/modules/generate-cache';
   createGenerateCacheModule({ ... });
   ```

4. **Update file naming**:
   - Fix `plain-classes` directory naming (was `plain-classses`)
   - Standardize module directory names

5. **Remove duplicate files**:
   - Delete old component directories after migration
   - Clean up duplicate utility functions

## Benefits

- **Reduced Code Duplication**: ~80% reduction in duplicate components and modules
- **Consistent Behavior**: All integrations use the same logic and UI
- **Easier Maintenance**: Bug fixes and features apply to all builders
- **Type Safety**: Shared TypeScript interfaces and utilities
- **Performance**: Shared modules reduce bundle size
- **Developer Experience**: Consistent patterns across integrations
- **Centralized Module Loading**: Unified approach to loading and initializing modules

## Testing

When making changes to shared components:

1. Test with all supported page builders
2. Verify variable picker functionality
3. Check cache generation triggers
4. Validate theme detection (where applicable)
5. Ensure drag-and-drop works correctly
6. Test storage/settings persistence