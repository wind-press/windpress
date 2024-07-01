import { stringify } from 'https://esm.sh/javascript-stringify';

const wizardToTailwindConfig = (wizards, tw_version) => {
    let configStr = /* javascript */ `const _wizardDefaultTheme = require('tailwindcss@${tw_version}/defaultTheme');`;

    let {
        screensItems,
        spacingItems,
        colorsItems,
        pluginsItems,
        typographyItems,
    } = traverseWizards(wizards);

    // screens
    if (screensItems.length > 0) {
        let _screenItems = {};
        screensItems.forEach((screen) => {
            let _screen = screen;
            let screenKey = _screen.breakpoint;

            delete _screen.breakpoint;
            delete _screen.id;

            Object.keys(_screen).forEach((key) => {
                if (_screen[key] && !isNaN(parseInt(_screen[key]))) {
                    _screen[key] = _screen[key] + 'px';
                } else {
                    delete _screen[key];
                }
            });

            _screenItems[screenKey] = _screen;
        });

        configStr += /* javascript */ `
            \n\n
            // https://tailwindcss.com/docs/screens
            const _wizardScreens = {};

            _wizardSortBreakpoints(Object.entries({...${stringify(_screenItems)}, ..._wizardDefaultTheme.screens}).map(([key, value]) => {
                return {
                    breakpoint: key,
                    ...(typeof value === 'string' ? { min: value } : value),
                };
            })).forEach((screen) => {
                let _screen = screen;
                let screenKey = _screen.breakpoint;
    
                delete _screen.breakpoint;
                delete _screen.id;
    
                Object.keys(_screen).forEach((key) => {
                    if (_screen[key] && !isNaN(parseInt(_screen[key]))) {
                        _screen[key] = _screen[key] + 'px';
                    } else {
                        delete _screen[key];
                    }
                });
    
                _wizardScreens[screenKey] = _screen;
            });

            _merge(windpress, {
                theme: {
                    screens: _wizardScreens,
                },
            });

            function _wizardNormalizeBreakpoint(value) {
                // Convert string formats like '640px' to numeric values
                const toNumber = value => value ? parseInt(value, 10) : null;
            
                // Handle different breakpoint formats
                if (typeof value === 'string') {
                    return { min: toNumber(value), max: Infinity };
                } else if (typeof value === 'object' && value !== null) {
                    return {
                        min: value.min ? toNumber(value.min) : Infinity, // Set to Infinity if min is not specified
                        max: value.max ? toNumber(value.max) : Infinity
                    };
                } else {
                    return { ...value, min: Infinity, max: Infinity };
                }
            }
            
            /**
             * 
             * @param {any[]} breakpoints 
             * @returns 
             */
            function _wizardSortBreakpoints(breakpoints) {
                return breakpoints
                    .map((breakpoint) => ({ ...breakpoint, ..._wizardNormalizeBreakpoint(breakpoint) }))
                    .sort((a, b) => {
                        if (a.min !== b.min) {
                            return a.min - b.min;
                        }
                        return b.max - a.max;
                    })
                    .reduce((sortedBreakpoints, bp) => {
                        // Reconstruct the original object structure
                        sortedBreakpoints.push(bp);
                        return sortedBreakpoints;
                    }, []);
            }
        `;
    }

    // spacing
    if (spacingItems.length > 0) {
        let _spacingItems = {};
        spacingItems.forEach((spacing) => {
            let _spacing = spacing;
            let spacingKey = _spacing.key;

            _spacingItems[spacingKey] = _spacing.value;
        });

        configStr += /* javascript */ `
            \n\n
            // https://tailwindcss.com/docs/customizing-spacing
            _merge(windpress, {
                theme: {
                    extend: {
                        spacing: ${stringify(_spacingItems)},
                    },
                },
            });
        `;
    }

    // typography
    if (typographyItems.length > 0) {
        let _typographyItems = {};
        typographyItems.forEach((typography) => {
            let _typography = typography;
            let typographyKey = _typography.key;

            _typographyItems[typographyKey] = _typography.value;
        });

        configStr += /* javascript */ `
            \n\n
            // https://tailwindcss.com/docs/font-size#customizing-your-theme
            _merge(windpress, {
                theme: {
                    extend: {
                        fontSize: ${stringify(_typographyItems)},
                    },
                },
            });
        `;
    }

    // colors
    if (colorsItems.length > 0) {
        let _colorsItems = {};
        colorsItems.forEach((color) => {
            let _color = color;
            let colorKey = _color.key;
            let _colorValue = {};

            if (_color.options.enableShades) {
                _colorValue = {
                    ..._colorValue,
                    ..._color.shades,
                };
            }

            // default color
            _colorValue = {
                ..._colorValue,
                DEFAULT: _color.value,
            };

            _colorsItems[colorKey] = _colorValue;
        });

        configStr += /* javascript */ `
            \n\n
            // https://tailwindcss.com/docs/customizing-colors#using-custom-colors
            _merge(windpress, {
                theme: {
                    extend: {
                        colors: ${stringify(_colorsItems)},
                    },
                },
            });
        `;
    }

    // plugins
    if (pluginsItems.length > 0) {
        let pluginStr = '';

        pluginsItems.forEach((plugin) => {
            let _plugin = plugin;
            let _pluginPath = '';

            if (_plugin.path && _plugin.path.trim() !== '') {
                _pluginPath = `/${_plugin.path.trim().replace(/^\//, '')}`;
            }

            pluginStr += /* javascript */ `require('${_plugin.name}@${_plugin.version}${_pluginPath}'),\n`;
        });

        configStr += /* javascript */ `
            \n\n
            // https://tailwindcss.com/docs/plugins
            _merge(windpress, {
                plugins: [
                    ${pluginStr}
                ],
            });
        `;
    }

    return /* javascript */ `
        \n\n
        /**
         * Generated from the Wizard.
         * 
         * @autogenerated
         * @placeholder \`//-@-wizard\`
         */
        ${configStr}
        \n\n
    `;
};

/**
 * traversing the wizards
 */
function traverseWizards(wizards) {
    let screensItems = [];
    let spacingItems = [];
    let colorsItems = [];
    let pluginsItems = [];
    let typographyItems = [];

    wizards.forEach((wizard) => {
        if (wizard.status === false) return;

        if (Object.keys(wizard.preset).length === 0) return;

        // screens
        if (wizard.preset.screens) {
            wizard.preset.screens.forEach((screen) => {
                screensItems.push(Object.assign({}, screen));
            });
        }

        // spacing
        if (wizard.preset.spacing) {
            wizard.preset.spacing.forEach((spacing) => {
                spacingItems.push(Object.assign({}, spacing));
            });
        }

        // colors
        if (wizard.preset.colors) {
            wizard.preset.colors.forEach((color) => {
                colorsItems.push(color);
            });
        }

        // plugins
        if (wizard.preset.plugins) {
            wizard.preset.plugins.forEach((plugin) => {
                pluginsItems.push(plugin);
            });
        }

        // typography
        if (wizard.preset.typography) {
            wizard.preset.typography.forEach((typography) => {
                typographyItems.push(typography);
            });
        }
    });

    return {
        screensItems,
        spacingItems,
        colorsItems,
        pluginsItems,
        typographyItems,
    };
}


export {
    wizardToTailwindConfig,
};