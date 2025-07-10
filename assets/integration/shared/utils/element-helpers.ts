/**
 * @module shared/utils/element-helpers
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Element helper utilities
 */

export function getActiveElement(): Element | null {
  return document.activeElement;
}

export function isElementFocused(element: Element): boolean {
  return document.activeElement === element;
}

export function focusElement(element: HTMLElement): void {
  element.focus();
}

export function getElementByDataAttribute(attribute: string, value: string): Element | null {
  return document.querySelector(`[data-${attribute}="${value}"]`);
}

export function getElementsWithClass(className: string): Element[] {
  return Array.from(document.querySelectorAll(`.${className}`));
}

export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

export function addClass(element: Element, className: string): void {
  element.classList.add(className);
}

export function removeClass(element: Element, className: string): void {
  element.classList.remove(className);
}

export function toggleClass(element: Element, className: string): void {
  element.classList.toggle(className);
}