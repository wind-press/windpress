import 'floating-vue/dist/style.css';
import './style.scss';

import { createApp, ref, watch } from 'vue';
import './master.css.js';
import { FontAwesomeIcon } from './font-awesome.js';
import { logger } from '@/integration/common/logger.js';
import InlineSvg from 'vue-inline-svg';
import FloatingVue from 'floating-vue';
import VResizable from 'v-resizable';
import App from './App.vue';
import { observe } from './utility.js';

const variableApp = document.createElement('windpressbricks-variable-app');
variableApp.id = 'windpressbricks-variable-app';
document.body.appendChild(variableApp);

const isOpen = ref(true);
const focusedInput = ref(null);
const tempInputValue = ref(null);
const recentColorPickerTarget = ref(null);
const recentVariableSelectionTimestamp = ref(0);
// const HOVER_VARIABLE_PREVIEW_TIMEOUT = 1000;

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
    .use(VResizable)
    ;

app
    .component('font-awesome-icon', FontAwesomeIcon)
    .component('inline-svg', InlineSvg)
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

const bricksInputs = {
    includedFields: [
        'div[data-control="number"]',
        {
            selector: 'div[data-control="text"]',
            hasChild: [
                "#_cssTransition",
                "#_transformOrigin",
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
    ],
    excludedFields: [
        ".control-query",
        'div[data-controlkey="start"]',
        'div[data-controlkey="perPage"]',
        'div[data-controlkey="perMove"]',
        'div[data-controlkey="speed"]',
    ],
};

function addTriggers() {
    setTimeout(() => {
        bricksInputs.includedFields.forEach((field) => {
            const wrappers = typeof field === 'string'
                ? [...document.querySelectorAll(field)]
                : [...document.querySelectorAll(field.selector)].filter((n) => field.hasChild.some((c) => n.querySelector(c)));
            wrappers.forEach((wrapper) => {
                const input = wrapper.querySelector("input[type='text']");
                if (input?.getAttribute('windpressbricks-variable-app') === 'true') {
                    return;
                }

                input?.removeEventListener('click', onInputClick);
                input?.addEventListener('click', onInputClick);
                input?.removeEventListener('focus', onFocusCallback);
                input?.addEventListener('focus', onFocusCallback);

                input?.setAttribute('windpressbricks-variable-app', 'true');
            });
        });

        const popupTriggers = [...document.querySelectorAll('.bricks-control-preview')].filter((trigger) => {
            return 'color' === trigger.closest('.control-inner')?.querySelector('label')?.getAttribute('for');
        });

        popupTriggers.forEach((popupTrigger) => {
            const tooltipTrigger = popupTrigger.querySelector('.color-value-tooltip');
            if (tooltipTrigger) {
                tooltipTrigger.setAttribute('data-balloon', tooltipTrigger.getAttribute('data-balloon') || 'Shift + right click to open the Variable Picker');
            }

            popupTrigger.addEventListener('contextmenu', (e) => {
                if (!e.shiftKey || !e.target) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                document?.getSelection()?.removeAllRanges();
                recentColorPickerTarget.value = e.target;
                focusedInput.value = null;
                isOpen.value = true;
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

logger('Module loaded!', { module: 'variable-picker' });