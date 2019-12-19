import { Directive, ElementRef, Input, AfterViewChecked, HostListener } from "@angular/core";
import { Renderer, AfterViewInit } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: '[float-label]',
    exportAs: 'floatLabel'
})
export class FloatLabelDirective implements AfterViewInit, AfterViewChecked {

    element: any;
    hasFocus: boolean = false;

    @Input() hasFloat: boolean = false;
    @Input() addLabel: boolean = true;
    @Input() labelClass: string = '';
    @Input() trimOnBlur: boolean = false;

    constructor(private elementRef: ElementRef,
        private renderer: Renderer,
        private ngControl: NgControl) {
    }
    /**
     * Initializing a FloatLabelDirective
     * @returns void
     */
    ngAfterViewInit(): void {
        this.labelClass = 'float-label--class ' + this.labelClass;
        this.element = this.elementRef.nativeElement;
        if (this.addLabel) {
            this.appendLabel(this.element);
        }
        this.toggleClass(false, this.element, true);
    }

    /**
     * Programatically change the value in floatlabel controls
     * @returns void
     */
    ngAfterViewChecked(): void {
        this.element = this.elementRef.nativeElement;
        this.toggleClass(this.hasFocus, this.element, true);
    }

    /**
     * Append an label for input elements
     * @param  {any} element
     * @returns void
     */
    appendLabel(element: any, count?: number): void {
        count = count || 0;
        setTimeout(() => {
            let label = this.renderer.createElement(element, 'label');
            let elementId = '';
            label.innerText = element.placeholder || element.getAttribute('data-placeholder') || '';
            if (label.innerText.trim().length === 0 && count < 3) {
                console.log(count);
                count++;
                this.appendLabel(element, count);
                return;
            }
            if (!element.id) {
                elementId = 'id_' + Date.now();
                element.id = elementId;
            }
            this.renderer.setElementAttribute(label, 'for', !element.id ? elementId : element.id);
            this.renderer.setElementAttribute(label, 'id', 'label-class');
            this.renderer.setElementAttribute(label, 'class', this.labelClass);
            this.renderer.attachViewAfter(element, [label]);
        }, 100);
    }
    /**
     * Adding a float label if the element has a Focus
     * @param  {any} event
     * @returns void
     */
    @HostListener('focus', ['$event'])
    onFocus(event: any): void {
        this.hasFocus = true;
        this.focusSelectedParent(event.currentTarget, this.hasFocus);
        this.toggleClass(true, event.currentTarget);
    }

    /**
     *  Add or Remove a float label if an element is in out of Focus
     * @param  {any} event
     * @returns void
     */
    @HostListener('blur', ['$event'])
    onBlur(event: any): void {
        this.hasFocus = false;
        this.focusSelectedParent(event.currentTarget, this.hasFocus);
        this.toggleClass(false, event.currentTarget);
        this.trimAndSetValue();
    }
    /**
     * @description Trim and set the value
     * @author njagadeesan
     * @date 2019-12-19
     * @memberof FloatLabelDirective
     */
    trimAndSetValue(): void {
        if (this.trimOnBlur && this.ngControl) {
            let controlValue = this.ngControl.control.value;
            if (controlValue && this.isString(controlValue)) {
                this.ngControl.control.setValue(controlValue.trim(), {
                    emitEvent: false,
                    onlySelf: true,
                    emitViewToModelChange: false
                });
            }
        }
    }
    /**
     * Add a 'has-float' class if the element has an value
     * @param  {boolean} isFocused
     * @param  {any} element
     * @param  {boolean} isInitialize?
     * @returns void
     */
    toggleClass(isFocused: boolean, element: any, isInitialize?: boolean): void {
        let parentEleClassList = element.parentElement.classList;
        let hasValue = this.checkValue(element);
        if (this.hasFloat) {
            parentEleClassList.add('has-float');
            return;
        }
        if (isInitialize && hasValue || this.addFloatByDefault(element)) {
            parentEleClassList.add('has-float');
            return;
        }
        if (isFocused) {
            if (!parentEleClassList.contains('has-float')) {
                parentEleClassList.add('has-float');
            }
        } else {
            if (!hasValue) {
                parentEleClassList.remove('has-float');
            }
        }
    }
    /**
     * check the inputs are having a value or not
     * @param  {any} element
     * @returns boolean
     */
    checkValue(element: any): boolean {
        if (element) {
            return element.value.toString().length > 0;
        }
        return false;
    }
    /**
     * Add a float label defaultly for
     * select, date, datetime input elements
     * @param  {any} element
     * @returns boolean
     */
    addFloatByDefault(element: any): boolean {
        if (element.nodeName === 'SELECT' || element.type === 'date') {
            return true;
        }
        return false;
    }
    /**
     * @description find the selected parent element
     * using selector
     * @param {*} elem
     * @param {*} selector
     * @returns {HTMLElement}
     * @memberof FloatLabelDirective
     */
    getClosest(elem, selector): HTMLElement {
        for (; elem && elem !== document; elem = elem.parentNode) {
            if (elem.classList.contains(selector)) {
                return elem;
            }
        }
        return null;
    };

    /**
     * @description Add/Remove error-focus for the particular parent element
     * on Focus/Blur
     * @param {HTMLElement} element
     * @param {boolean} isFocused
     * @memberof FloatLabelDirective
     */
    focusSelectedParent(element: HTMLElement, isFocused: boolean): void {
        let focusParent = this.getClosest(element, 'input-focus');
        if (focusParent) {
            if (isFocused) {
                focusParent.classList.add('error-focus');
            } else {
                focusParent.classList.remove('error-focus');
            }
            this.showErrorBlock(focusParent, isFocused);
        }
    }

    /**
     * @description
     * @date 2018-10-31
     * @param {HTMLElement} parent
     * @param {boolean} focused
     * @memberof FloatLabelDirective
     */
    showErrorBlock(parent: HTMLElement, focused: boolean): void {
        setTimeout(() => {
            const errorFocus = parent.querySelector('.err-block');
            if (errorFocus) {
                if (focused) {
                    errorFocus.classList.add('hide');
                    errorFocus.classList.remove('show');
                } else {
                    errorFocus.classList.add('show');
                    errorFocus.classList.remove('hide');
                }
            }
        }, 0);
    }
    /**
     * @description Check the value is String type
     * @author njagadeesan
     * @date 2019-12-19
     * @param {*} value
     * @returns {boolean}
     * @memberof FloatLabelDirective
     */
    isString(value: any): boolean {
        return typeof value === 'string';
    }
}
