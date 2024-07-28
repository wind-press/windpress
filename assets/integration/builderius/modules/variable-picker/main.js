import 'floating-vue/dist/style.css';
import './style.scss';

import { createApp, nextTick, ref, watch } from 'vue';
import './master.css.js';
import { FontAwesomeIcon } from './font-awesome.js';
import { logger } from '@/integration/common/logger.js';
import InlineSvg from 'vue-inline-svg';
import FloatingVue from 'floating-vue';
import VResizable from 'v-resizable';
import App from './App.vue';
import { observe } from './utility.js';

const variableApp = document.createElement('windpressbuilderius-variable-app');
variableApp.id = 'windpressbuilderius-variable-app';
document.body.appendChild(variableApp);

// Copy the Editor CSS variables to the Variable App
for (const rule of document.getElementById('builderius-builder-css').sheet.cssRules) {
    if (rule.selectorText && rule.selectorText.includes('#builderiusPanel')) {
        for (let i = 0; i < rule.style.length; i++) {
            const propertyName = rule.style[i];
            if (propertyName.startsWith('--')) {
                variableApp.style.setProperty(propertyName, rule.style.getPropertyValue(propertyName).trim());
            }
        }
    }
}

const isOpen = ref(false);
const focusedInput = ref(null);
const tempInputValue = ref(null);
const recentVariableSelectionTimestamp = ref(0);
const recentActiveSelector = ref(null);

const app = createApp(App);

app.config.globalProperties.windpressbuilderius = window.windpressbuilderius;

app.provide('variableApp', variableApp);
app.provide('isOpen', isOpen);
app.provide('focusedInput', focusedInput);
app.provide('tempInputValue', tempInputValue);
app.provide('recentVariableSelectionTimestamp', recentVariableSelectionTimestamp);

app
    .use(FloatingVue, {
        container: '#windpressbuilderius-variable-app',
    })
    .use(VResizable)
    ;

app
    .component('font-awesome-icon', FontAwesomeIcon)
    .component('inline-svg', InlineSvg)
    ;

app.mount('#windpressbuilderius-variable-app');


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

const builderiusInputs = {
    includedFields: [
        'div.uniCssInput',
        'div.uniCssColorpicker',
        // 'div[data-control="number"]',
        // {
        //     selector: 'div[data-control="text"]',
        //     hasChild: [
        //         "#_cssTransition",
        //         "#_transformOrigin",
        //         "#_flexBasis",
        //         "#_overflow",
        //         "#_gridTemplateColumns",
        //         "#_gridTemplateRows",
        //         "#_gridAutoColumns",
        //         "#_gridAutoRows",
        //         "#_objectPosition",
        //         '[id^="raw-"]',
        //     ],
        // },
    ],
    excludedFields: [
        // ".control-query",
        // 'div[data-controlkey="start"]',
        // 'div[data-controlkey="perPage"]',
        // 'div[data-controlkey="perMove"]',
        // 'div[data-controlkey="speed"]',
    ],
};

function addTriggers() {
    setTimeout(() => {
        let shouldReset = false;

        builderiusInputs.includedFields.forEach((field) => {
            const wrappers = typeof field === 'string'
                ? [...document.querySelectorAll(field)]
                : [...document.querySelectorAll(field.selector)].filter((n) => field.hasChild.some((c) => n.querySelector(c)));
            wrappers.forEach((wrapper) => {
                const input = wrapper.querySelector("input[type='text']");
                if (input?.getAttribute('windpressbuilderius-variable-app') === 'true') {
                    return;
                }

                input?.removeEventListener('click', onInputClick);
                input?.addEventListener('click', onInputClick);
                input?.removeEventListener('focus', onFocusCallback);
                input?.addEventListener('focus', onFocusCallback);

                input?.setAttribute('windpressbuilderius-variable-app', 'true');
                input?.parentNode.setAttribute('data-tooltip-place', 'top');
                input?.parentNode.setAttribute('data-tooltip-content', 'Shift + click to open the Variable Picker');

                shouldReset = true;
            });
        });

        const currentSelector = document.querySelector('div.uniSystemSelectClasses__valueWrapper span.uniSystemSelectClasses__placeholder')
            ? '%root%'
            : document.querySelector('div.uniSystemSelectClasses__valueWrapper div.uniModuleCssSelectorItemSelected span')?.innerText;

        if (recentActiveSelector.value !== currentSelector) {
            recentActiveSelector.value = currentSelector;
        }

        if (shouldReset) {
            focusedInput.value = null;
            tempInputValue.value = null;
        }
    }, 100);
}

let isObserverRunning = false;
observe({
    selector: `.uniLeftPanelOuter`,
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

watch(recentActiveSelector, (value, oldValue) => {
    if (value !== oldValue) {
        focusedInput.value = null;
        tempInputValue.value = null;
    }
});

logger('Module loaded!', { module: 'variable-picker' });