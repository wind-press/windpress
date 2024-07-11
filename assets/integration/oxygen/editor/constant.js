const oxygenScope = angular.element(window.top.document.body).scope();
const iframeScope = oxygenScope.iframeScope;
const oxyIframe = document.querySelector('#ct-artificial-viewport');

export {
    oxygenScope,
    iframeScope,
    oxyIframe
};