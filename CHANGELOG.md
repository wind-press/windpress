# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Note:** The Pro version has a version number with one higher minor version than the Free version.

For instance:
- Free version 1.**0**.4
- Pro version 1.**1**.4

## [Unreleased]
### Fixed
- The `wizard.css` file is not updated correctly on the syncing process

## [3.3.44] - 2025-07-09
### Added
- Upgraded to Tailwind CSS v4 (4.1.11 latest)
- [TW4] The Wizard feature is now available on the Dashboard page

## [3.3.43] - 2025-06-12
### Added
- Upgraded to Tailwind CSS v4 (4.1.10 latest)

## [3.3.42] - 2025-06-06
### Changed
- [Gutenberg] Run the Play Observer / Compiler even if the visual editor is not iframed

## [3.3.41] - 2025-06-04
### Fixed
- [Bricks] Variables contain `--` in the value being registered to the Bricks Global Variables system
- Plugin's bundle (Zip) file are not generated correctly

## [3.3.40] - 2025-06-01
### Changed
- [Bricks] The Plain Classes and Variables feature compat for version 2.0-beta
- Optimize the bundle (Zip) size of the plugin

## [3.3.39] - 2025-05-29
### Added
- Upgraded to Tailwind CSS v4 (4.1.8 latest)

### Changed
- [TW4] The Play Observer / Compiler performance & stability
- [TW4] Robust `@import` handling

## [3.3.35] - 2025-05-28
### Changed
- [Gutenberg] The Play Observer / Compiler stability

### Fixed
- [TW4] `@import` a CDN stylesheet is not working correctly

## [3.3.34] - 2025-05-24
### Added
- [Etch](https://etchwp.com/) integration **[Pro]** (experimental)

## [3.3.33] - 2025-05-20
### Added
- Upgraded to Tailwind CSS v4 (4.1.7 latest)
- Added context menu to the Simple File System explorer (right-click on the file explorer)

## [3.3.32] - 2025-05-11
### Added
- Upgraded to Tailwind CSS v4 (4.1.6 latest)

### Fixed
- Unable to add new files to the Simple File System

## [3.3.31] - 2025-05-09
### Added
- Upgraded to Tailwind CSS v4 (4.1.5 latest)

### Changed
- [TW4] The compiler is now logging the candidates it has found to aid in debugging

## [3.3.30] - 2025-04-29
### Changed
- [Gutenberg] Load the The Play Observer / Compiler to the Pattern preview [#40](https://github.com/wind-press/windpress/issues/40)
- [Bricks] The Plain Classes feature compat for version 2.0-alpha [#42](https://github.com/wind-press/windpress/issues/42)

### Fixed
- [Bricks] The Plain Classes field is not synchronized with the history (undo/redo) actions [#44](https://github.com/wind-press/windpress/issues/44)

## [3.3.29] - 2025-04-15
### Added
- Upgraded to Tailwind CSS v4 (4.1.4 latest)

## [3.3.28] - 2025-04-08
### Changed
- Safari browser compatibility
- [Metabox Views] Scanner now use the rendered data instead of the raw data

## [3.3.27] - 2025-04-07
### Fixed
- [TW4] `@source` directive with `jsdelivr` CDN is not working correctly

## [3.3.26] - 2025-04-06
### Added
- Upgraded to Tailwind CSS v4 (4.1.3 latest)

### Changed
- [TW4] Autocompletion feature now supports user-defined classes from the Simple File System data.
- Exclude the WindPress files from being processed by the SiteGround Speed Optimizer plugin

### Fixed
- [Gutenberg] Misconfigured integration on the block editor

## [3.3.24] - 2025-04-03
### Fixed
- [TW4] Error on generate cache caused by the `@source` directive change in the Tailwind CSS v4 (4.1.1)

## [3.3.23] - 2025-04-02
### Added
- Upgraded to Tailwind CSS v4 (4.1.1 latest)

### Changed
- Add keyboard shortcuts to Generate Cache on the WindPress dashboard page
- [TW3] The Play Observer / Compiler performance & stability

## [3.3.22] - 2025-03-28
### Fixed
- Storage issue on the Incremental Generate Cache feature [#34](https://github.com/wind-press/windpress/issues/34)

## [3.3.21] - 2025-03-28
### Changed
- [Experimental] The plugin is now fully translatable. Help us to translate the plugin into your language on [WordPress.org](https://translate.wordpress.org/projects/wp-plugins/windpress)

## [3.3.12] - 2025-03-27
### Added
- Upgraded to Tailwind CSS v4 (4.0.17 latest)

## [3.3.11] - 2025-03-27
### Added
- Upgraded to Tailwind CSS v4 (4.0.16 latest)

## [3.3.7] - 2025-03-27
### Fixed
- Browser compatibility issue with the latest compiler update.
- File on the editor are marked as read-only on Windows OS

## [3.3.5] - 2025-03-27
### Added
- Upgraded to Tailwind CSS v4 (4.0.15 latest)
- [TW4] The compiler now can generating cache on the front-end page. This only available if the "Admin always uses Compiler" setting is enabled.

### Fixed
- [TW4][Breakdance, Bricks, Builderius, LiveCanvas, Oxygen Classic] The "Generate Cache on Save" feature are not available on the previous version

## [3.3.4] - 2025-03-27
### Fixed
- [TW4] The local stylesheet import is not resolved correctly

## [3.3.3] - 2025-03-27
### Added
- [Oxygen 6](https://oxygenbuilder.com/ref/12/) integration **[Pro]** (experimental)

### Changed
- [TW4] The Play Observer / Compiler performance & stability

### Fixed
- [TW4][Breakdance] The style are now instantly applied on the editor

## [3.3.2] - 2025-03-27
### Added
- Upgraded to Tailwind CSS v4 (4.0.14 latest)
- Refreshed the WindPress dashboard page design and layout for better user experience. Built with the latest [Nuxt UI](https://ui.nuxt.com/pro?aff=GZ5Zd)

### Fixed
- [TW3] The `tailwind.config.js` file are not properly loaded

## [3.2.35] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.9 latest)

### Changed
- [TW4] Importing additional CSS files with the `@import` directive are now with the following format: `@import "fetch:https://example.com/path/to/the/file.css";`

## [3.2.34] - 2024-12-19
### Fixed
- Generating cache process issue on module resolution in the `main.css` file

## [3.2.33] - 2024-12-19
### Fixed
- Generating cache process issue on `@import` directive in the `main.css` file

## [3.2.32] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.8 latest)
- [WPCodeBox 2](https://wpcodebox.com/) integration **[Pro]**

### Changed
- Better performance on the generating cache process
- [TW4] Generating the CSS cache will remove unused CSS variables. To always keep it, add them within the `@theme static { }` block in the `main.css` file. Alternatively, you can replace the `@import 'tailwindcss/theme.css' layer(theme);` code to `@import "tailwindcss/theme.css" layer(theme) theme(static);` on your `main.css` file.

## [3.2.31] - 2024-12-19
### Fixed
- Simple File System imported data are not loaded correctly

## [3.2.30] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.7 latest)

### Fixed
- [TW4] The `@source` directive is causing error when loaded in the page builders' editor

## [3.2.29] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.6 latest)
- [TW4] The `@source` directive is now supported but differs from the official Tailwind CSS version. Please refer to [our documentation](https://wind.press/docs/configuration/file-main-css#scanning-additional-sources) for details.

## [3.2.28] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.5 latest)

## [3.2.27] - 2024-12-19
### Added
- Simple File System data are now exportable and importable from the WindPress dashboard page

## [3.2.26] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.4 latest)

## [3.2.25] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.3 latest)

## [3.2.24] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.1 latest)

## [3.2.23] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0 latest)

## [3.2.22] - 2024-12-19
### Fixed
- [Gutenberg] The CSS class field autofocusing issue on the block editor
- [Gutenberg, Breakdance, Bricks, Builderius, LiveCanvas, Oxygen] The "Generate Cache on Save" feature doesn't use the selected Tailwind CSS version

## [3.2.21] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-beta.6 next)

### Fixed
- [Breakdance] Editor style is mixed with admin-bar style (margin-top)

## [3.2.20] - 2024-12-19
### Changed
- Decouple the Gutenberg-based integrations' scanner

### Fixed
- [Gutenberg, Breakdance, Bricks, Oxygen] The hover preview feature is too late to disappear when the mouse is moved away from the class name

## [3.2.19] - 2024-12-19
### Added
- [Blockstudio](https://blockstudio.dev/?ref=7) integration **[Pro]**
- Upgraded to Tailwind CSS v3 (3.4.16)
- Upgraded to Tailwind CSS v4 (4.0.0-beta.5 next)

## [3.2.18] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-beta.4 next)
- [Meta Box Views](https://metabox.io/plugins/mb-views/) integration **[Pro]**

## [3.2.17] - 2024-12-19
### Added
- The new website and documentation is now live at [wind.press](https://wind.press)
- Upgraded to Tailwind CSS v4 (4.0.0-beta.2 next)

### Fixed
- Scanned classes names are not unescaped correctly ([#4](https://github.com/wind-press/windpress/issues/4))

## [3.2.16] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-beta.1 next)

## [3.2.15] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v3 (3.4.15)
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.34 next)

### Changed
- Test compatibility with WordPress 6.7
- The [LiveCanvas](https://livecanvas.com/?ref=4008) integration is now available on the Free version
- Tailwind CSS v3 stubs/default content are updated for the upcoming Wizard feature

### Fixed
- [Gutenberg] Missing the WindPress data on the block editor

## [3.2.13] - 2024-12-19
### Fixed
- Settings page doesn't loaded

## [3.2.12] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.33 next)

### Changed
- [Breakdance, Bricks, Builderius, Oxygen] Variable Picker feature is now updated to the latest Tailwind CSS v4 variable names
- Tailwind CSS v3 stubs are updated for the upcoming Wizard feature

### Fixed
- [Bricks] The Variable Picker panel is not showing correctly on the Bricks editor

## [3.2.10] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.32 next)

## [3.2.9] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.30 next)

## [3.2.8] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.29 next)

## [3.2.7] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.28 next)

## [3.2.6] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v3 (3.4.14)
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.27 next)
- [Bricks] added settings to enable or disable WindPress' features. Right-click the WindPress icon on the Editor's top bar to access the settings.

## [3.2.5] - 2024-12-19
### Changed
- Reduce the number of Play modules loaded on the front-end page for non-admin users
- The Ubiquitous panel is now automatically hidden when outside of the panel is clicked

## [3.2.4] - 2024-12-19
### Fixed
- Breakdance integration doesn't work on the editor due to fail to load the required JavaScript files

## [3.2.3] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.26 next)

### Changed
- Properly handling the local JavaScript modules
- Renamed some action and filter hooks
- Some integrations' features are conditionally loaded based on the supported Tailwind CSS version

## [3.2.1] - 2024-12-19
### Added
- Porting the Tailwind CSS v4 specific integration features to the Tailwind CSS v3: Autocompletion, Sort, and Class name to CSS

### Changed
- The Play Observer regenerates the CSS only if new classes are added to the DOM

## [3.2.0] - 2024-12-19
### Added
- Tailwind CSS v3 support has been added
- Upgraded to Tailwind CSS v3 (3.4.13)

### Changed
- Disable the preflight styles by default on the new installation
- The CSS and JavaScript files are now deletable by emptying the content
- The `main.css` and `tailwind.config.js` files are now resettable by emptying the content

## [3.1.17] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.25 next)

## [3.1.15] - 2024-12-19
### Changed
- Added the bundled Tailwind CSS version number on the settings page
- Relative path support for the local CSS and JavaScript files

## [3.1.14] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.24 next)
- A simple local CSS and JavaScript file support to manage the Tailwind CSS customizations

### Fixed
- The Ubiquitous Panel feature issue on the Bricks editor

## [3.1.11] - 2024-12-19
### Changed
- Temporary disable the Ubiquitous Panel feature on the Bricks editor due to causing issue with the integration.

## [3.1.10] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.23 next)
- Initial support on Tailwind CSS configs loaded from CDN with the `@config` directive

### Changed
- Internationalization (i18n) support on the admin dashboard

### Fixed
- Some style issues on the admin dashboard

## [3.1.9] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.21 next)
- Initial support on Tailwind CSS plugins loaded from CDN with the `@plugin` directive

### Changed
- Internationalization (i18n) support on the admin dashboard

## [3.1.8] - 2024-12-19
### Added
- [Gutenberg](https://wordpress.org/gutenberg) integration.
- [GreenShift](https://shop.greenshiftwp.com/?from=3679) integration.
- [Kadence WP](https://kadencewp.com) integration.

## [3.1.6] - 2024-12-19
### Changed
- Internationalization (i18n) support

## [3.1.0] - 2024-12-19
### Added
- Upgraded to Tailwind CSS v4 (4.0.0-alpha.20 next)
- [Timber](https://upstatement.com/timber/) integration
- [Bricks](https://bricksbuilder.io/) integration **[Pro]**
- [Breakdance](https://breakdance.com/ref/165/) integration **[Pro]**
- [Builderius](https://builderius.io/?referral=afdfca82c8) integration **[Pro]**
- [LiveCanvas](https://livecanvas.com/?ref=4008) integration **[Pro]**
- [Oxygen](https://oxygenbuilder.com/ref/12/) integration **[Pro]**

### Changed
- Test compatibility with WordPress 6.6

## [1.1.0] - 2024-12-19
### Added
- 🐣 Initial release.