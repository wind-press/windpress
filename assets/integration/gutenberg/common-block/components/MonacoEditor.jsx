import { useEffect, useRef, useState, useCallback, useMemo, memo } from '@wordpress/element';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker?worker&url';
import htmlWorkerUrl from 'monaco-editor/esm/vs/language/html/html.worker?worker&url';
import { debounce } from 'lodash-es';

// Configure Monaco Environment for workers
if (typeof window !== 'undefined' && !window.MonacoEnvironment) {
	window.MonacoEnvironment = {
		getWorker(_, label) {
			if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return new Worker(htmlWorkerUrl, { type: 'module' });
			}
			return new Worker(editorWorkerUrl, { type: 'module' });
		}
	};
}

/**
 * Monaco Editor Component for HTML editing
 *
 * @param {Object} props
 * @param {string} props.value - Editor content
 * @param {Function} props.onChange - Callback when content changes
 * @param {string} props.language - Editor language (default: 'html')
 * @param {number} props.height - Editor height in pixels (default: 400)
 * @param {Object} props.options - Additional Monaco editor options
 */
function MonacoEditor({
	value = '',
	onChange,
	language = 'html',
	height = 400,
	options = {}
}) {
	const editorRef = useRef(null);
	const containerRef = useRef(null);
	const subscriptionRef = useRef(null);
	const valueRef = useRef(value);
	const preventUpdateRef = useRef(false);

	// Detect if Gutenberg is in dark mode
	const [isDarkMode, setIsDarkMode] = useState(() => {
		if (typeof document !== 'undefined') {
			return document.documentElement.classList.contains('is-dark-theme') ||
				   document.body.classList.contains('is-dark-theme');
		}
		return false;
	});

	// Memoize editor options to prevent recreation
	const editorOptions = useMemo(() => ({
		automaticLayout: true,
		minimap: { enabled: false },
		lineNumbers: 'on',
		scrollBeyondLastLine: false,
		wrappingIndent: 'indent',
		fontSize: 13,
		tabSize: 2,
		formatOnPaste: true,
		formatOnType: false,
		...options
	}), [options]);

	// Memoize the onChange handler with debouncing
	// Increased debounce from 300ms to 500ms for better performance
	const debouncedOnChange = useMemo(() => {
		if (!onChange) return null;
		return debounce((value) => {
			preventUpdateRef.current = true;
			onChange(value);
		}, 500);
	}, [onChange]);

	const handleChange = useCallback((currentValue) => {
		valueRef.current = currentValue;
		if (debouncedOnChange) {
			debouncedOnChange(currentValue);
		}
	}, [debouncedOnChange]);

	// Cleanup debounced function on unmount
	useEffect(() => {
		return () => {
			if (debouncedOnChange) {
				debouncedOnChange.cancel();
			}
		};
	}, [debouncedOnChange]);

	useEffect(() => {
		if (!containerRef.current || editorRef.current) return;

		// Detect theme changes
		const observer = new MutationObserver(() => {
			const dark = document.documentElement.classList.contains('is-dark-theme') ||
						 document.body.classList.contains('is-dark-theme');
			if (dark !== isDarkMode) {
				setIsDarkMode(dark);
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ['class']
		});

		// Create editor instance
		const editor = monaco.editor.create(containerRef.current, {
			value: value,
			language: language,
			theme: isDarkMode ? 'vs-dark' : 'vs',
			...editorOptions
		});

		editorRef.current = editor;
		valueRef.current = value;

		// Listen for content changes
		subscriptionRef.current = editor.onDidChangeModelContent(() => {
			const currentValue = editor.getValue();
			handleChange(currentValue);
		});

		// Cleanup on unmount
		return () => {
			observer.disconnect();
			if (subscriptionRef.current) {
				subscriptionRef.current.dispose();
				subscriptionRef.current = null;
			}
			if (editorRef.current) {
				editorRef.current.dispose();
				editorRef.current = null;
			}
		};
	}, []); // Only create editor once

	// Update theme when it changes
	useEffect(() => {
		if (editorRef.current) {
			monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs');
		}
	}, [isDarkMode]);

	// Update editor value when prop changes externally (not from user typing)
	useEffect(() => {
		// Skip if this update is coming from the editor's own onChange
		if (preventUpdateRef.current) {
			preventUpdateRef.current = false;
			return;
		}

		// Only update if value actually changed
		if (value === valueRef.current) {
			return;
		}

		if (editorRef.current) {
			const editor = editorRef.current;
			const currentValue = editor.getValue();

			// Only update if different from current editor content
			if (value !== currentValue) {
				// Preserve cursor position and selection
				const position = editor.getPosition();
				const selection = editor.getSelection();

				editor.setValue(value);
				valueRef.current = value;

				// Restore cursor position
				if (position) {
					editor.setPosition(position);
				}
				if (selection) {
					editor.setSelection(selection);
				}
				editor.focus();
			}
		}
	}, [value]);

	return (
		<div
			ref={containerRef}
			style={{
				height: `${height}px`,
				border: '1px solid #ddd',
				borderRadius: '4px',
				overflow: 'hidden'
			}}
		/>
	);
}

// Custom comparison function for MonacoEditor
// Only re-render when value, language, height, or key options change
function arePropsEqual(prevProps, nextProps) {
	return (
		prevProps.value === nextProps.value &&
		prevProps.language === nextProps.language &&
		prevProps.height === nextProps.height &&
		JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
	);
}

// Memoize component with custom comparison
export default memo(MonacoEditor, arePropsEqual);
