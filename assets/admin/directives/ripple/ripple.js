import './ripple.css';

const DomHandler = {
    hasClass(element, className) {
        if (element) {
            if (element.classList) return element.classList.contains(className);
            else return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        }

        return false;
    },

    addClass(element, className) {
        if (element && className && !this.hasClass(element, className)) {
            if (element.classList) element.classList.add(className);
            else element.className += ' ' + className;
        }
    },

    removeClass(element, className) {
        if (element && className) {
            if (element.classList) element.classList.remove(className);
            else element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    },

    getHeight(el) {
        if (el) {
            let height = el.offsetHeight;
            let style = getComputedStyle(el);

            height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

            return height;
        }

        return 0;
    },

    getWidth(el) {
        if (el) {
            let width = el.offsetWidth;
            let style = getComputedStyle(el);

            width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

            return width;
        }

        return 0;
    },

    getOuterWidth(el, margin) {
        if (el) {
            let width = el.offsetWidth;

            if (margin) {
                let style = getComputedStyle(el);

                width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            }

            return width;
        }

        return 0;
    },

    getOuterHeight(el, margin) {
        if (el) {
            let height = el.offsetHeight;

            if (margin) {
                let style = getComputedStyle(el);

                height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
            }

            return height;
        }

        return 0;
    },

    getOffset(el) {
        if (el) {
            let rect = el.getBoundingClientRect();

            return {
                top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
                left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0)
            };
        }

        return {
            top: 'auto',
            left: 'auto'
        };
    },
}

let timeout;

function bindEvents(el) {
    el.addEventListener('mousedown', onMouseDown);
}

function unbindEvents(el) {
    el.removeEventListener('mousedown', onMouseDown);
}

function create(el) {
    let ink = document.createElement('span');

    DomHandler.addClass(el, 'p-ripple');

    ink.className = 'p-ink';
    ink.setAttribute('role', 'presentation');
    ink.setAttribute('aria-hidden', 'true');
    el.appendChild(ink);

    ink.addEventListener('animationend', onAnimationEnd);
}

function remove(el) {
    let ink = getInk(el);

    if (ink) {
        unbindEvents(el);
        ink.removeEventListener('animationend', onAnimationEnd);
        ink.remove();
    }
}

function onMouseDown(event) {
    let target = event.currentTarget;
    let ink = getInk(target);

    if (!ink || getComputedStyle(ink, null).display === 'none') {
        return;
    }

    DomHandler.removeClass(ink, 'p-ink-active');

    if (!DomHandler.getHeight(ink) && !DomHandler.getWidth(ink)) {
        let d = Math.max(DomHandler.getOuterWidth(target), DomHandler.getOuterHeight(target));

        ink.style.height = d + 'px';
        ink.style.width = d + 'px';
    }

    let offset = DomHandler.getOffset(target);
    let x = event.pageX - offset.left + document.body.scrollTop - DomHandler.getWidth(ink) / 2;
    let y = event.pageY - offset.top + document.body.scrollLeft - DomHandler.getHeight(ink) / 2;

    ink.style.top = y + 'px';
    ink.style.left = x + 'px';
    DomHandler.addClass(ink, 'p-ink-active');

    timeout = setTimeout(() => {
        if (ink) {
            DomHandler.removeClass(ink, 'p-ink-active');
        }
    }, 401);
}

function onAnimationEnd(event) {
    if (timeout) {
        clearTimeout(timeout);
    }

    DomHandler.removeClass(event.currentTarget, 'p-ink-active');
}

function getInk(el) {
    for (let i = 0; i < el.children.length; i++) {
        if (typeof el.children[i].className === 'string' && el.children[i].className.indexOf('p-ink') !== -1) {
            return el.children[i];
        }
    }

    return null;
}

const Ripple = {
    mounted(el, binding) {
        create(el);
        bindEvents(el);
    },
    unmounted(el) {
        remove(el);
    }
};

export default Ripple;