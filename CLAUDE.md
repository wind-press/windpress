# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

WindPress is a WordPress plugin that integrates Tailwind CSS (v3 and v4) into WordPress without requiring a build step. It provides a browser-based compilation system and integrates with popular page builders and themes.

## Development Commands

### Frontend Development
- `pnpm run dev` - Start development server with Vite (port 3000)
- `pnpm run build` - Build production assets
- `pnpm run lint` - Run linting with oxlint and eslint
- `pnpm run format` - Auto-fix linting issues
- `pnpm run test` - Run tests with vitest

### Backend Development
- `composer install` - Install PHP dependencies
- `composer run phpstan` - Run PHPStan static analysis
- `composer run check-ecs` - Check code style with ECS
- `composer run fix-ecs` - Fix code style issues
- `composer run rector` - Run Rector for code modernization
- `composer run complete-check` - Run all checks (ECS, PHPStan, PHPUnit)

## Architecture

### Plugin Structure
- **Main Plugin File**: `windpress.php` - WordPress plugin entry point
- **Core Classes**: `src/` directory with PSR-4 autoloading (`WindPress\WindPress\` namespace)
- **Assets**: `assets/` directory for frontend code
- **Build Output**: `build/` directory for compiled assets

### Key Components

#### Backend (PHP)
- **Plugin.php**: Main plugin class implementing singleton pattern, handles lifecycle
- **Core/Runtime.php**: Manages frontend asset loading and Tailwind CSS compilation
- **Integration/**: Page builder integrations (Bricks, Oxygen, Gutenberg, etc.)
- **Api/**: REST API endpoints for dashboard functionality
- **Admin/AdminPage.php**: WordPress admin page registration

#### Frontend (Vue.js + TypeScript)
- **Dashboard**: Vue 3 SPA with Vue Router and Pinia for state management
- **Main Entry**: `assets/dashboard/main.ts` - Vue app initialization
- **Components**: `assets/dashboard/components/` - Reusable Vue components
- **Pages**: `assets/dashboard/pages/` - Route-based page components
- **Stores**: Pinia stores for state management (settings, volume, logs, etc.)
- **Composables**: Vue composables for shared logic

#### Tailwind CSS Integration
- **Browser Compilation**: CSS generated in browser using WASM
- **Dual Version Support**: Supports both Tailwind CSS v3 and v4
- **Observer System**: Monitors DOM changes for class extraction
- **Cache System**: Optional caching for performance optimization

### Integration Architecture
Each page builder integration follows a consistent pattern:
- **Main.php**: Integration initialization and hooks
- **Compile.php**: Asset compilation logic
- **Editor.php**: Editor-specific enhancements
- **JavaScript modules**: Frontend integration code in `assets/integration/`

## Key Development Patterns

### PHP Patterns
- **Singleton Pattern**: Used for main classes (Plugin, Runtime, etc.)
- **Hook System**: Extensive use of WordPress actions/filters with namespaced hooks (`a!windpress/` for actions, `f!windpress/` for filters)
- **PSR-4 Autoloading**: All classes follow PSR-4 standard
- **Type Safety**: Strict typing with PHP 7.4+ features

### Frontend Patterns
- **Vue 3 Composition API**: All components use `<script setup>` syntax
- **TypeScript**: Strict typing throughout frontend code
- **Auto-imports**: Components and composables auto-imported via unplugin
- **Monorepo Structure**: Shared packages in `assets/packages/`

### Build System
- **Vite**: Primary build tool with extensive plugin configuration
- **Multi-entry**: Multiple entry points for different features
- **Asset Optimization**: Automatic code splitting and optimization
- **WordPress Integration**: Custom Vite plugin for WordPress compatibility

## File Organization

### Critical Files
- `windpress.php` - WordPress plugin header and bootstrap
- `src/Plugin.php` - Main plugin class
- `src/Core/Runtime.php` - Frontend runtime logic
- `assets/dashboard/main.ts` - Vue app entry point
- `vite.config.js` - Build configuration
- `composer.json` - PHP dependencies and scripts
- `package.json` - Node.js dependencies and scripts

### Directory Structure
```
├── src/                    # PHP source code
│   ├── Core/              # Core plugin functionality
│   ├── Integration/       # Page builder integrations
│   ├── Admin/             # WordPress admin functionality
│   ├── Api/               # REST API endpoints
│   └── Utils/             # Utility classes
├── assets/                # Frontend assets
│   ├── dashboard/         # Vue.js dashboard app
│   ├── integration/       # Page builder integration scripts
│   └── packages/          # Shared frontend packages
├── build/                 # Compiled assets (generated)
├── languages/             # Translation files
└── stubs/                 # Template files for new projects
```

## Testing

### Frontend Testing
- **Vitest**: Unit testing framework
- **Vue Test Utils**: Component testing utilities
- Run tests with `pnpm run test`

### Backend Testing
- **PHPUnit**: Unit and integration tests
- **PHPStan**: Static analysis (level 8)
- **ECS**: Code style enforcement
- Run with `composer run complete-check`

## Common Development Tasks

### Adding New Page Builder Integration
1. Create new directory in `src/Integration/[BuilderName]/`
2. Implement `Main.php`, `Compile.php`, and `Editor.php`
3. Add frontend integration in `assets/integration/[builder-name]/`
4. Register in `src/Integration/Loader.php`

### Modifying Dashboard
1. Components in `assets/dashboard/components/`
2. Pages in `assets/dashboard/pages/`
3. Routes in `assets/dashboard/router.ts`
4. State management in `assets/dashboard/stores/`

### Working with Tailwind CSS Compilation
1. Core logic in `assets/packages/core/tailwindcss/`
2. Observer system monitors DOM changes
3. WASM-based compilation for both v3 and v4
4. Cache system in `src/Core/Cache.php`

## WordPress Integration

### Plugin Lifecycle
- **Activation**: Database setup, option initialization
- **Deactivation**: Cleanup (minimal)
- **Upgrade**: Version-specific migrations
- **Uninstall**: Complete cleanup (if implemented)

### REST API
- **Namespace**: `windpress/v1`
- **Authentication**: WordPress nonce system
- **Endpoints**: Defined in `src/Api/` directory

### Asset Loading
- **Vite Integration**: Custom WordPress-specific Vite plugin
- **Conditional Loading**: Assets loaded based on context
- **Cache Busting**: Automatic versioning for cache invalidation

## Performance Considerations

### Frontend
- **Code Splitting**: Automatic via Vite
- **Lazy Loading**: Route-based component loading
- **Asset Optimization**: Minification and compression
- **Cache Strategy**: Browser caching for static assets

### Backend
- **Query Optimization**: Minimal database queries
- **Caching**: File-based caching for compiled CSS
- **Lazy Loading**: Classes loaded on demand
- **Memory Management**: Efficient resource usage

## Security

### Input Validation
- **Sanitization**: All user inputs sanitized
- **Nonce Protection**: CSRF protection via WordPress nonces
- **Permission Checks**: Capability-based access control
- **Escape Output**: All output properly escaped

### File Operations
- **Restricted Paths**: File operations limited to plugin directory
- **Validation**: File type and content validation
- **Security Headers**: Appropriate headers for asset loading