import { compile as _compile } from '../build';
import { decodeVFSContainer } from '../vfs';
import { Instrumentation } from './instrumentation';

// Adapted from '@tailwindcss/browser' package

// Warn users about using the browser build in production as early as possible.
// It can take time for the script to do its work so this must be at the top.
console.warn(
    'The compiler of Tailwind CSS should not be used in production. To use Tailwind CSS in production, use the cached CSS: https://wind.press/docs/guide/concepts/cache',
)

/**
 * The list of all seen classes on the page so far. The compiler already has a
 * cache of classes but this lets us only pass new classes to `build(…)`.
 */
let classes = new Set<string>()

/**
 * The stylesheet that we use to inject the compiled CSS into the page.
 */
let sheet = document.createElement('style')

/**
 * The queue of build tasks that need to be run. This is used to ensure that we
 * don't run multiple builds concurrently.
 */
let buildQueue = Promise.resolve()

/**
 * What build this is
 */
let nextBuildId = 1

/**
 * Used for instrumenting the build process. This data shows up in the
 * performance tab of the browser's devtools.
 */
let I = new Instrumentation()

/**
 * The last input VFS that was compiled. If script "change" without
 * actually changing, we can avoid a full rebuild.
 */
let lastVFS = ''

/**
 * The current Tailwind CSS compiler.
 *
 * This gets recreated:
 * - When VFS change
 */
let compiler: Awaited<ReturnType<typeof _compile>>;

/**
 * Create the Tailwind CSS compiler
 *
 * This handles loading imports, plugins, configs, etc…
 *
 * This does **not** imply that the CSS is actually built. That happens in the
 * `build` function and is a separate scheduled task.
 */
async function createCompiler() {
    I.start(`Create compiler`)
    I.start('Reading VFS')

    let script = document.querySelector('script#windpress\\:vfs[type="text/plain"]') as HTMLScriptElement | null;
    if (!script) {
        throw new Error('Script element with id "windpress:vfs" and type "text/plain" not found.');
    }

    let vfs = script?.textContent || '';

    I.end('Reading VFS', {
        size: vfs.length,
        changed: lastVFS !== vfs,
    })

    // The input VFS did not change so the compiler does not need to be recreated
    if (lastVFS === vfs) return

    lastVFS = vfs

    I.start('Compile CSS')
    try {
        compiler = await _compile({
            // candidates: Array.from(candidates) as string[],
            entrypoint: '/main.css',
            volume: decodeVFSContainer(lastVFS || 'e30=')
        })
    } finally {
        I.end('Compile CSS')
        I.end(`Create compiler`)
    }

    classes.clear()
}

async function build(kind: 'full' | 'incremental') {
    if (!compiler) return

    // 1. Refresh the known list of classes
    let newClasses = new Set<string>()

    I.start(`Collect classes`)

    for (let element of document.querySelectorAll('[class]')) {
        for (let c of element.classList) {
            if (classes.has(c)) continue

            classes.add(c)
            newClasses.add(c)
        }
    }

    I.end(`Collect classes`, {
        count: newClasses.size,
    })

    if (newClasses.size === 0 && kind === 'incremental') return

    // 2. Compile the CSS
    I.start(`Build utilities`)

    sheet.textContent = compiler.build(Array.from(newClasses))

    I.end(`Build utilities`)
}



function rebuild(kind: 'full' | 'incremental') {
    async function run() {
        if (!compiler && kind !== 'full') {
            return
        }

        let buildId = nextBuildId++

        I.start(`Build #${buildId} (${kind})`)

        if (kind === 'full') {
            await createCompiler()
        }

        I.start(`Build`)
        await build(kind)
        I.end(`Build`)

        I.end(`Build #${buildId} (${kind})`)
    }

    buildQueue = buildQueue.then(run).catch((err) => I.error(err))
}

// // Handle changes to known stylesheets
// let styleObserver = new MutationObserver(() => rebuild('full'))

// function observeSheet(sheet: HTMLStyleElement) {
//     styleObserver.observe(sheet, {
//         attributes: true,
//         attributeFilter: ['type'],
//         characterData: true,
//         subtree: true,
//         childList: true,
//     })
// }

// Handle changes to the document that could affect the styles
// - Changes to any element's class attribute
// - New stylesheets being added to the page
// - New elements (with classes) being added to the page
const observer = new MutationObserver((records) => {
    let full = 0
    let incremental = 0

    for (let record of records) {
        // // New stylesheets == tracking + full rebuild
        // for (let node of record.addedNodes as Iterable<HTMLElement>) {
        //     if (node.nodeType !== Node.ELEMENT_NODE) continue
        //     if (node.tagName !== 'STYLE') continue
        //     if (node.getAttribute('type') !== STYLE_TYPE) continue

        //     observeSheet(node as HTMLStyleElement)
        //     full++
        // }

        // New nodes require an incremental rebuild
        for (let node of record.addedNodes) {
            if (node.nodeType !== 1) continue

            // Skip the output stylesheet itself to prevent loops
            if (node === sheet) continue

            incremental++
        }

        // Changes to class attributes require an incremental rebuild
        if (record.type === 'attributes') {
            incremental++
        }
    }

    if (full > 0) {
        return rebuild('full')
    } else if (incremental > 0) {
        return rebuild('incremental')
    }
});

// if not found constant that disable the observer don't run the observer
if (!(window as any)['__windpress__disablePlayObserver']) {
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true,
    });

    rebuild('full');

    document.head.append(sheet);
} else {
    console.warn('Play Observer is disabled.');
}

// expose the observer to the global scope for debugging
try {
    (window as any).twPlayObserver = observer
}
catch (e) {}