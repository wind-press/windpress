export interface WindPressIconProps {
    width?: number;
    height?: number;
    'aria-hidden'?: boolean;
    focusable?: boolean;
}

export interface AutocompleteItem {
    value: string;
    color?: string;
    fontWeight?: string;
    namespace?: string;
}

export interface TributeItem {
    original: AutocompleteItem;
    string: string;
}

export interface BlockEditProps {
    name: string;
    clientId: string;
    attributes: {
        className?: string;
        [key: string]: any;
    };
    setAttributes: (attributes: any) => void;
}

export type ShikiHighlighter = any;

export interface WindPressGlobal {
    module: {
        classnameToCss: {
            generate: (className: string) => Promise<string>;
        };
        classSorter: {
            sort: (classes: string) => Promise<string>;
        };
    };
}

declare global {
    interface Window {
        windpress: WindPressGlobal;
        wp: any;
        twPlayObserverStart?: () => void;
    }
}