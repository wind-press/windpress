import { __unstable__loadDesignSystem } from 'tailwindcss';
import { loadModule } from './module';
import { loadStylesheet } from './stylesheet';
import { preprocess } from './pre-process';
import safe from 'postcss-safe-parser';
import { parse, stringify } from '@adobe/css-tools';

import type { DesignSystem } from '@tailwindcss/root/packages/tailwindcss/src/design-system';
import type { VFSContainer } from './vfs';

export type LoadDesignSystemOptions = {
    entrypoint?: string;
    volume?: VFSContainer;
    [key: string]: any;
}

/**
 * Removes @apply directives from CSS content using proper CSS parsing
 * This ensures valid CSS is maintained even with incomplete @apply statements
 */
function cleanCssContent(cssContent: string): string {
    try {
        // Parse the CSS using @adobe/css-tools
        const ast = parse(cssContent, {
            silent: true, // Don't throw on parse errors, handle gracefully
            source: 'input.css'
        });

        // Recursively walk through the AST and remove @apply rules
        function walkRules(rules: any[]): any[] {
            return rules.filter(rule => {
                // Remove @apply at-rules
                if (rule.type === 'rule' && rule.selectors) {
                    // Keep CSS rules, but clean their declarations
                    if (rule.declarations) {
                        rule.declarations = rule.declarations.filter((decl: any) => {
                            // Remove any malformed declarations that might be @apply remnants
                            return decl.type === 'declaration' && decl.property && !decl.property.includes('@apply');
                        });
                    }
                    return true;
                } else if (rule.type === 'atrule' && rule.name === 'apply') {
                    // Remove @apply at-rules entirely
                    return false;
                } else if (rule.type === 'atrule' && rule.rules) {
                    // For other at-rules (like @media), recursively clean their contents
                    rule.rules = walkRules(rule.rules);
                    return true;
                }
                // Keep all other rule types
                return true;
            });
        }

        // Clean the stylesheet
        if (ast.stylesheet && ast.stylesheet.rules) {
            ast.stylesheet.rules = walkRules(ast.stylesheet.rules);
        }

        // Convert back to CSS string
        return stringify(ast, { compress: false });
    } catch (error) {
        // If CSS parsing fails completely, fall back to regex-based cleaning
        console.warn('CSS parsing failed, falling back to regex cleaning:', error);

        let content = cssContent;
        // Fallback regex patterns (same as before but more conservative)
        content = content.replace(/@apply\s+[^;{}]*;/g, '');
        content = content.replace(/@apply\s+[^{}]*(?=\s*})/g, '');
        content = content.replace(/@apply\s+[^;{}]*$/gm, '');
        content = content.replace(/^\s*@apply\s*$/gm, '');

        return content;
    }
}


export async function loadDesignSystem({ entrypoint = '/main.css', volume = {} as VFSContainer, ...opts }: LoadDesignSystemOptions = {}): Promise<DesignSystem> {
    // Clean all CSS files in the volume by removing @apply directives
    const cleanedVolume = { ...volume };

    let isStrict = false;
    if (opts?.strict === true) {
        isStrict = true;
        delete opts.strict;
    }

    if (!isStrict) {
        Object.keys(cleanedVolume).forEach(key => {
            if (key.endsWith('.css')) {
                cleanedVolume[key] = cleanCssContent(cleanedVolume[key]);
            }
        });
    }

    opts = {
        entrypoint,
        volume: cleanedVolume,
        ...opts,
        parser: opts.strict ? safe : null
    };


    opts.volume[opts.entrypoint] = (await preprocess(opts)).css;

    // @ts-ignore
    return __unstable__loadDesignSystem(opts.volume[opts.entrypoint], {
        ...opts,
        loadModule: async (modulePath, base, resourceHint) => loadModule(modulePath, base, resourceHint, opts.volume),
        loadStylesheet: async (id, base) => loadStylesheet(id, base, opts.volume)
    });
}