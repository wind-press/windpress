/**
 * @module variables 
 * @package WindPress
 * @since 1.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Register the variables entry to the Bricks' variable manager and preview the variables on hover.
 */

import { brxGlobalProp, brxIframe } from '@/integration/bricks/constant.js';
import { getVariableList } from '@/packages/core/tailwind';
import { logger } from '@/integration/common/logger';
import { __unstable__loadDesignSystem } from 'tailwindcss';
import { customAlphabet } from 'nanoid';

const randomId = () => customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6)();

function generateId() {
    let id = randomId();

    while (id.match(/^\d/)) {
        id = randomId();
    }

    return `windpress${id}`;
}

async function registerVariables() {
    // drop global variables with the category of windpress
    brxGlobalProp.$_state.globalVariables = brxGlobalProp.$_state.globalVariables.filter(variable => variable.category !== 'windpress');

    // register category if not exists
    if (!brxGlobalProp.$_state.globalVariablesCategories.find(category => category.id === 'windpress')) {
        brxGlobalProp.$_state.globalVariablesCategories.push({
            "id": "windpress",
            "name": "WindPress"
        });
    }

    // get design system
    const main_css = await brxIframe.contentWindow.wp.hooks.applyFilters('windpress.module.design_system.main_css');

    // register variables
    const variableLists = getVariableList(__unstable__loadDesignSystem(main_css));
    variableLists.forEach(variable => {
        brxGlobalProp.$_state.globalVariables.push({
            id: generateId(),
            name: variable.key.substring(2),
            value: variable.value,
            category: "windpress"
        });
    });
}

const channel = new BroadcastChannel('windpress');
channel.addEventListener('message', async (e) => {
    const data = e.data;
    const source = 'windpress/autocomplete';
    const target = 'any';
    const task = 'windpress.main_css.saved.done';

    if (data.source === source && data.task === task) {
        setTimeout(() => {
            registerVariables();
        }, 1000);

    }
});

registerVariables();

// Preview variables on hover
function applyVariableOnHover() {
    if (brxGlobalProp.$_state.activePanel !== "element") {
        return;
    }

    const activeElement = brxGlobalProp.$_state?.activeElement;
    const activeElementId = activeElement?.id;
    if (!activeElementId) {
        return;
    }

    const iframeWindow = brxIframe?.contentWindow;
    if (!iframeWindow) {
        return;
    }
    const wrapper = document.querySelector('.expand .options-wrapper');
    const searchInput = wrapper?.querySelector('.searchable');
    const dropdown = wrapper?.querySelector('.dropdown');

    const hoveredItems = dropdown?.querySelectorAll('.variable-picker-item:not(.title)');

    const focusedInput = document.querySelector('.variable-picker-button.open')?.previousElementSibling;

    if (!focusedInput || !hoveredItems?.length || !wrapper || !dropdown || !searchInput) {
        return;
    }

    // Function to handle mouseenter event
    const handleMouseEnter = (item) => {
        const content = item.querySelector('span:first-of-type')?.textContent ?? '';
        if (!focusedInput || !content) {
            return;
        }
        triggerPreview(valueToVar(content));
    };
    // Function to handle click event
    const handleClick = (item) => {
        const content = item.querySelector('span:first-of-type')?.textContent ?? '';
        if (!focusedInput || !content) {
            return;
        }
        const tempValue = valueToVar(content);
        focusedInput.value = tempValue;
        focusedInput.click();
    };
    // Observer to reopen dropdown on mouseleave
    const observerCallBack = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('open')) {
                const target = entry.target;
                target.click();
            }
        });
    };
    // Reopen dropdown
    const reOpenDropdown = () => {
        triggerPreview(tempValue);
        const btn = focusedInput.nextElementSibling;
        observer.observe(btn);
        wrapper.removeEventListener('mouseleave', reOpenDropdown);
    };
    // Function to create and insert list items
    const insertItems = (items, container) => {
        items.forEach(variable => {
            const [key, value] = Object.entries(variable)[0] || [];
            container.insertAdjacentHTML('beforeend', `
                <li class="variable-picker-item">
                    <span>${key}</span>
                    <span class="option-value">${value}</span>
                </li>
            `);
        });
        // Add events to items
        const variableItems = customDropdown.querySelectorAll('.variable-picker-item');
        variableItems.forEach(item => {
            item.addEventListener('mouseenter', () => handleMouseEnter(item));
            item.addEventListener('click', () => handleClick(item));
        });
    };
    // Function to show preview
    const triggerPreview = (value) => {
        focusedInput.value = value;
        focusedInput.dispatchEvent(new Event("input"));
        focusedInput.focus();
    };
    // String to css var
    const valueToVar = (value) => `var(--${value})`;
    // Variables: [{ name: value }]
    const variables = [];
    // remove native dropdown
    dropdown.remove();
    // Get option values
    hoveredItems.forEach(item => {
        const name = item.querySelector('span:first-of-type')?.textContent ?? '';
        const content = item.querySelector('span.option-value')?.textContent ?? '';
        variables.push({ [name]: content });
    });
    // Create and append custom dropdown
    const customDropdown = document.createElement('ul');
    customDropdown.classList.add('custom-dropdown');
    const styles = `
        max-height: calc(32px * 10);
        overflow: hidden;
        overflow-y: auto;
        position: relative;
        scrollbar-color: rgba(0, 0, 0, .4) rgba(0, 0, 0, .2);
        scrollbar-width: thin;
    `;
    customDropdown.setAttribute('style', styles);
    insertItems(variables, customDropdown);
    wrapper.appendChild(customDropdown);
    searchInput.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
    // Search in dropdown
    searchInput.addEventListener('input', (e) => {
        const filteredItems = variables.filter(variable => {
            const key = Object.keys(variable)[0]?.toLowerCase() ?? '';
            return key.includes(searchInput.value.toLowerCase());
        });
        customDropdown.innerHTML = '';
        insertItems(filteredItems, customDropdown);
    });
    // Temp value for input
    let tempValue = focusedInput?.value ?? ' ';

    // Create observer
    const observer = new IntersectionObserver(observerCallBack, {
        root: focusedInput.parentElement
    });
    // Events
    // Reset input on mouse leave
    wrapper.addEventListener('mouseleave', reOpenDropdown);
    observer.disconnect();
};

const innerPanel = document.querySelector("#bricks-panel-inner:not(div.bricks-control-popup *)");
if (!innerPanel) {
    logger("Inner panel not found, can't initialize preview of variables on hover", { module: 'variables', type: 'error' });
    throw new Error("Inner panel not found, can't initialize preview of variables on hover");
}

const observer = new MutationObserver(applyVariableOnHover);
observer.observe(innerPanel, {
    subtree: true,
    childList: true,
    attributes: true
});

logger('Module loaded!', { module: 'variables' });