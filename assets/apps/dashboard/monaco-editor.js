/**
 * https://github.com/imguolao/monaco-vue#vite
 * https://github.com/vitejs/vite/issues/13680#issuecomment-1819274694
 */
import { loader } from '@guolao/vue-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution';
import 'monaco-editor/esm/vs/language/css/monaco.contribution.js';
import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main.js';
import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker?worker&url';
import cssWorkerUrl from 'monaco-editor/esm/vs/language/css/css.worker?worker&url';

function WorkaroundWorker(workerUrl, options) {
    const js = `import ${JSON.stringify(new URL(workerUrl, import.meta.url))}`;
    const blob = new Blob([js], { type: "application/javascript" });
    const objURL = URL.createObjectURL(blob);
    const worker = new Worker(objURL, { type: "module", name: options?.name });
    worker.addEventListener("error", (e) => {
        URL.revokeObjectURL(objURL);
    })
    return worker;
}

self.MonacoEnvironment = {
    async getWorker(_, label) {
        if (label === 'css' || label === 'scss' || label === 'less') {
            return WorkaroundWorker(cssWorkerUrl);
        }
        return WorkaroundWorker(editorWorkerUrl);
    }
}

loader.config({ monaco });
