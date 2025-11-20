/**
 * @module generate-cache/preferences-menu
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 *
 * Add WindPress preferences to Gutenberg editor settings sidebar
 */

import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as preferencesStore } from '@wordpress/preferences';
import { ToggleControl, PanelBody, PanelRow, Button } from '@wordpress/components';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { registerPlugin } from '@wordpress/plugins';
import WindPressIconOriginal from '~/windpress.svg?react';
import { useDarkMode } from '../../hooks/useDarkMode';

const PREFERENCE_NAME = 'windpressGenerateCacheOnSave';
const SCOPE = 'windpress/gutenberg';

const WindPressIcon = () => {
    return (
        <WindPressIconOriginal width={20} height={20} aria-hidden="true" focusable="false" />
    );
};

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
);

const SystemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M12 17v4m10-8.693V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693M8 21h8"/>
            <circle cx="19" cy="6" r="3"/>
        </g>
    </svg>
);

/**
 * WindPress Settings Sidebar
 */
function WindPressSettingsSidebar() {
    const { set } = useDispatch(preferencesStore);

    const isEnabled = useSelect((select) => {
        return select(preferencesStore).get(SCOPE, PREFERENCE_NAME) ?? true;
    }, []);

    const handleToggle = (value) => {
        set(SCOPE, PREFERENCE_NAME, value);
    };

    const { theme, applyTheme } = useDarkMode();

    return (
        <>
            <PluginSidebarMoreMenuItem
                target="windpress-settings"
                icon={<WindPressIcon />}
            >
                {__('WindPress', 'windpress')}
            </PluginSidebarMoreMenuItem>
            <PluginSidebar
                name="windpress-settings"
                title={__('WindPress Settings', 'windpress')}
                icon={<WindPressIcon />}
            >
                <PanelBody
                    title={__('Appearance', 'windpress')}
                    initialOpen={true}
                >
                    <PanelRow>
                        <div style={{ width: '100%' }}>
                            <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', color: '#1e1e1e' }}>
                                {__('Theme', 'windpress')}
                            </div>
                            <div style={{ display: 'flex', width: '100%', gap: 0 }}>
                                <Button
                                    icon={<SunIcon />}
                                    variant="secondary"
                                    onClick={() => applyTheme('light')}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        gap: '4px',
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                        marginRight: '-1px',
                                        backgroundColor: theme === 'light' ? 'var(--wp-admin-theme-color)' : undefined,
                                        color: theme === 'light' ? '#fff' : undefined,
                                        borderColor: theme === 'light' ? 'var(--wp-admin-theme-color)' : undefined
                                    }}
                                >
                                    {__('Light', 'windpress')}
                                </Button>
                                <Button
                                    icon={<MoonIcon />}
                                    variant="secondary"
                                    onClick={() => applyTheme('dark')}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        gap: '4px',
                                        borderRadius: 0,
                                        marginRight: '-1px',
                                        backgroundColor: theme === 'dark' ? 'var(--wp-admin-theme-color)' : undefined,
                                        color: theme === 'dark' ? '#fff' : undefined,
                                        borderColor: theme === 'dark' ? 'var(--wp-admin-theme-color)' : undefined
                                    }}
                                >
                                    {__('Dark', 'windpress')}
                                </Button>
                                <Button
                                    icon={<SystemIcon />}
                                    variant="secondary"
                                    onClick={() => applyTheme('system')}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        gap: '4px',
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0,
                                        backgroundColor: theme === 'system' ? 'var(--wp-admin-theme-color)' : undefined,
                                        color: theme === 'system' ? '#fff' : undefined,
                                        borderColor: theme === 'system' ? 'var(--wp-admin-theme-color)' : undefined
                                    }}
                                >
                                    {__('System', 'windpress')}
                                </Button>
                            </div>
                        </div>
                    </PanelRow>
                </PanelBody>
                <PanelBody
                    title={__('Cache Generation', 'windpress')}
                    initialOpen={true}
                >
                    <PanelRow>
                        <ToggleControl
                            label={__('Generate cache on save', 'windpress')}
                            help={__('Automatically regenerate Tailwind CSS cache when saving posts. This ensures your Tailwind classes are compiled immediately after saving.', 'windpress')}
                            checked={isEnabled}
                            onChange={handleToggle}
                        />
                    </PanelRow>
                </PanelBody>
            </PluginSidebar>
        </>
    );
}

/**
 * Register the WindPress settings plugin
 */
export function registerWindPressSettingsSidebar() {
    registerPlugin('windpress-settings', {
        render: WindPressSettingsSidebar,
        icon: <WindPressIcon />,
    });
}
