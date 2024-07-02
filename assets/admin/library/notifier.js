import 'awesome-notifications/dist/style.css';
import AWN from 'awesome-notifications';
import { icon } from '@fortawesome/fontawesome-svg-core';
import {
    faGear,
    faCircleCheck,
    faCircleQuestion,
    faCircleInfo,
    faCircleExclamation,
    faTriangleExclamation,
} from '@fortawesome/pro-solid-svg-icons';

export function useNotifier(options = {}) {
    return new AWN(Object.assign({
        icons: {
            prefix: '',
            suffix: '',

            tip: `<div class="icon-tip">${icon(faCircleQuestion).html}</div>`,
            async: `<div class="icon-async">${icon(faGear).html}</div>`,
            info: `<div class="icon-info">${icon(faCircleInfo).html}</div>`,
            success: `<div class="icon-success">${icon(faCircleCheck).html}</div>`,
            warning: `<div class="icon-warning">${icon(faCircleExclamation).html}</div>`,
            alert: `<div class="icon-alert">${icon(faTriangleExclamation).html}</div>`,
        }
    }, options));
}
