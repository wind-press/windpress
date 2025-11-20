import { ToolbarButton, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDarkMode } from '../../hooks/useDarkMode';

function DarkModeToggle() {
	const { theme, applyTheme, cycleTheme } = useDarkMode();

	const getIcon = () => {
		if (theme === 'light') {
			return (
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
		} else if (theme === 'dark') {
			return (
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
				</svg>
			);
		} else {
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 17v4m10-8.693V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693M8 21h8"/><circle cx="19" cy="6" r="3"/></g></svg>
			);
		}
	};

	const getLabel = () => {
		if (theme === 'light') {
			return __('Theme: Light', 'windpress');
		} else if (theme === 'dark') {
			return __('Theme: Dark', 'windpress');
		} else {
			return __('Theme: System', 'windpress');
		}
	};

	return (
		<Dropdown
			popoverProps={{ placement: 'bottom-start' }}
			renderToggle={({ isOpen, onToggle }) => (
				<ToolbarButton
					icon={getIcon()}
					label={getLabel()}
					onClick={cycleTheme}
					onContextMenu={(e) => {
						e.preventDefault();
						onToggle();
					}}
					aria-expanded={isOpen}
				/>
			)}
			renderContent={() => (
				<MenuGroup label={__('Theme', 'windpress')}>
					<MenuItem
						icon={
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
						}
						isSelected={theme === 'light'}
						onClick={() => applyTheme('light')}
					>
						{__('Light', 'windpress')}
					</MenuItem>
					<MenuItem
						icon={
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
							</svg>
						}
						isSelected={theme === 'dark'}
						onClick={() => applyTheme('dark')}
					>
						{__('Dark', 'windpress')}
					</MenuItem>
					<MenuItem
						icon={
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 17v4m10-8.693V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.693M8 21h8"/><circle cx="19" cy="6" r="3"/></g></svg>
						}
						isSelected={theme === 'system'}
						onClick={() => applyTheme('system')}
					>
						{__('System', 'windpress')}
					</MenuItem>
				</MenuGroup>
			)}
		/>
	);
}

export default DarkModeToggle;
