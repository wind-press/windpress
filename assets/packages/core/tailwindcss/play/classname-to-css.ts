import { candidatesToCss } from '../intellisense';
import type { DesignSystem } from '@tailwindcss/root/packages/tailwindcss/src/design-system';

export async function classnameToCss(design: DesignSystem, input: string) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    let css = await candidatesToCss(design, classes);

    return Array.isArray(css) ? css.join(" ") : css;
}