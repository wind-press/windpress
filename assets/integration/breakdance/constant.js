// const brx = document.querySelector('.brx-body');
// const brxGlobalProp = document.querySelector('.brx-body').__vue_app__.config.globalProperties;
// const brxIframe = document.getElementById('bricks-builder-iframe');
// const brxIframeGlobalProp = brxIframe.contentDocument.querySelector('.brx-body').__vue_app__.config.globalProperties;

// export {
//     brx,
//     brxGlobalProp,
//     brxIframe,
//     brxIframeGlobalProp
// };

const bde = document.querySelector('#app');
const bdeV = bde.__vue__;
const bdeIframe = document.querySelector('#app #iframe')?.contentDocument.querySelector('#breakdance_canvas');
const bdeIframeV = bdeIframe.__vue__;

export {
    bde,
    bdeV,
    bdeIframe,
    bdeIframeV
};