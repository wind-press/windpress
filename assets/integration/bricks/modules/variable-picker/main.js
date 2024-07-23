import { createApp } from 'vue';
import 'floating-vue/dist/style.css';
import './style.scss';

import './master.css.js';
import { FontAwesomeIcon } from './font-awesome.js';
import { logger } from '@/integration/common/logger.js';
import InlineSvg from 'vue-inline-svg';
import FloatingVue from 'floating-vue';
import VResizable from 'v-resizable';

import App from './App.vue';
import { brxGlobalProp } from '../../constant.js';

const innerPanelId = "bricks-panel-inner";
const innerPanel = document.getElementById(innerPanelId);

const bricksInputs = {};

const observe = ({ selector, callback, options, }) => {
    const observer = new MutationObserver(callback);
    const target = document.querySelector(selector);
    if (!target) {
        logger(`Target not found for selector: ${selector}`, { module: 'variable-picker', type: 'error' });
        return;
    }
    const DEFAULT_OPTIONS = {
        childList: true,
        subtree: true,
    };
    observer.observe(target, Object.assign(Object.assign({}, DEFAULT_OPTIONS), options));
};

const TIMEOUT = 100;
let isObserverRunning = false;


const variableApp = document.createElement('windpressbricks-variable-app');
variableApp.id = 'windpressbricks-variable-app';
document.body.appendChild(variableApp);

const app = createApp(App);

app.config.globalProperties.windpressbricks = window.windpressbricks;

app.provide('variableApp', variableApp);

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















// observe({
//     selector: `#${innerPanelId}`,
//     options: {
//         subtree: true,
//         childList: true,
//     },
//     callback() {
//         if (isObserverRunning) {
//             return;
//         }
//         isObserverRunning = true;
//         // this.addTriggers();
//         setTimeout(() => {
//             isObserverRunning = false;
//         }, TIMEOUT);
//     },
// });

logger('Module loaded!', { module: 'variable-picker' });

