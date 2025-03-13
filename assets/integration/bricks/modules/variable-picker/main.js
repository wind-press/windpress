import './style.scss';

import { createApp, nextTick, ref, watch } from 'vue';
import { logger } from '@/integration/common/logger.js';
import InlineSvg from 'vue-inline-svg';
import FloatingVue from 'floating-vue';
import App from './App.vue';
import { observe } from './utility.js';

const variableApp = document.createElement('windpressbricks-variable-app');
variableApp.id = 'windpressbricks-variable-app';
variableApp.classList.add('master-css');
document.body.appendChild(variableApp);

const isOpen = ref(false);
const focusedInput = ref(null);
const tempInputValue = ref(null);
const recentColorPickerTarget = ref(null);
const recentVariableSelectionTimestamp = ref(0);

const app = createApp(App);

app.config.globalProperties.windpressbricks = window.windpressbricks;

app.provide('variableApp', variableApp);
app.provide('isOpen', isOpen);
app.provide('focusedInput', focusedInput);
app.provide('tempInputValue', tempInputValue);
app.provide('recentColorPickerTarget', recentColorPickerTarget);
app.provide('recentVariableSelectionTimestamp', recentVariableSelectionTimestamp);

app
    .use(FloatingVue, {
        container: '#windpressbricks-variable-app',
    })
    ;

app
    .component('InlineSvg', InlineSvg)
    ;

app.mount('#windpressbricks-variable-app');

function onInputClick(e) {
    if (!e.shiftKey || !e.target) {
        return;
    }

    document?.getSelection()?.removeAllRanges();
    e.preventDefault();
    e.stopPropagation();
    focusedInput.value = e.target;
    tempInputValue.value = e.target.value;
    isOpen.value = true;
}

function onFocusCallback(e) {
    focusedInput.value = e.target;
}

const bricksInputs = [
    'div[data-control="number"]',
    {
        selector: 'div[data-control="text"]',
        hasChild: [
            "#_flexBasis",
            "#_overflow",
            "#_gridTemplateColumns",
            "#_gridTemplateRows",
            "#_gridAutoColumns",
            "#_gridAutoRows",
            "#_objectPosition",
            '[id^="raw-"]',
        ],
    },
];

function addTriggers() {
    setTimeout(() => {
        bricksInputs.forEach((field) => {
            const wrappers = typeof field === 'string'
                ? [...document.querySelectorAll(field)]
                : [...document.querySelectorAll(field.selector)].filter((n) => field.hasChild.some((c) => n.querySelector(c)));
            wrappers.forEach((wrapper) => {
                const input = wrapper.querySelector("input[type='text']");
                if (input?.getAttribute('windpressbricks-variable-app') === 'listened') {
                    return;
                }

                input?.removeEventListener('click', onInputClick);
                input?.addEventListener('click', onInputClick);
                input?.removeEventListener('focus', onFocusCallback);
                input?.addEventListener('focus', onFocusCallback);

                input?.setAttribute('windpressbricks-variable-app', 'listened');
                input?.parentNode.setAttribute('data-balloon', 'Shift + click to open the Variable Picker');
                input?.parentNode.setAttribute('data-balloon-pos', 'bottom-right');
            });
        });

        const popupTriggers = [...document.querySelectorAll('.bricks-control-preview')].filter((trigger) => {
            return 'color' === trigger.closest('.control-inner')?.querySelector('label')?.getAttribute('for');
        });

        popupTriggers.forEach((popupTrigger) => {
            popupTrigger.addEventListener('contextmenu', (e) => {
                if (!e.shiftKey || !e.target) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                document?.getSelection()?.removeAllRanges();
                focusedInput.value = null;
                isOpen.value = true;

                recentColorPickerTarget.value = null; // ensure the watcher is triggered
                nextTick(() => {
                    recentColorPickerTarget.value = e.target;
                });
            });
        });
    }, 100);
}

let isObserverRunning = false;
observe({
    selector: `#bricks-panel-inner`,
    options: {
        subtree: true,
        childList: true,
    },
    callback() {
        if (isObserverRunning) {
            return;
        }
        isObserverRunning = true;
        addTriggers();
        setTimeout(() => {
            isObserverRunning = false;
        }, 100);
    },
});

addTriggers();

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) {
        isOpen.value = false;
    }
});

watch(isOpen, (value) => {
    variableApp.style.zIndex = value ? 'calc(Infinity)' : '-1';
});

logger('Module loaded!', { module: 'variable-picker' });