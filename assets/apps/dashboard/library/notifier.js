import 'awesome-notifications/dist/style.css';
import AWN from 'awesome-notifications';

import Fa6SolidCircleCheck from '~icons/fa6-solid/circle-check?raw';
import Fa6SolidGear from '~icons/fa6-solid/gear?raw';
import Fa6SolidCircleQuestion from '~icons/fa6-solid/circle-question?raw';
import Fa6SolidCircleExclamation from '~icons/fa6-solid/circle-exclamation?raw';
import Fa6SolidTriangleExclamation from '~icons/fa6-solid/triangle-exclamation?raw';
import Fa6SolidCircleInfo from '~icons/fa6-solid/circle-info?raw';

export function useNotifier(options = {}) {
    return new AWN(Object.assign({
        icons: {
            prefix: '',
            suffix: '',

            success: `<div class="icon-success">${Fa6SolidCircleCheck}</div>`,
            tip: `<div class="icon-tip">${Fa6SolidCircleQuestion}</div>`,
            async: `<div class="icon-async">${Fa6SolidGear}</div>`,
            info: `<div class="icon-info">${Fa6SolidCircleInfo}</div>`,
            warning: `<div class="icon-warning">${Fa6SolidCircleExclamation}</div>`,
            alert: `<div class="icon-alert">${Fa6SolidTriangleExclamation}</div>`,
        }
    }, options));
}
