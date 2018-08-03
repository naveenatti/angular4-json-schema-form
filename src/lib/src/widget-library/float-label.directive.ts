import { Directive, ElementRef, Input, AfterViewChecked } from "@angular/core";
import { Renderer, AfterViewInit } from "@angular/core";
import { ElementDef } from '@angular/core/src/view';

@Directive({
    selector: '[float-label]',
    host: {
        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur($event)'
    }
})
export class FloatLabelDirective implements AfterViewInit, AfterViewChecked {

    element: any;
    hasFocus: boolean = false;

    @Input() hasFloat: boolean = false;
    @Input() addLabel: boolean = true;
    @Input() labelClass: string = '';

    constructor(private elementRef: ElementRef, private renderer: Renderer) {
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
    onFocus(event: any): void {
        this.hasFocus = true;
        this.toggleClass(true, event.currentTarget);
    }

    /**
     *  Add or Remove a float label if an element is in out of Focus
     * @param  {any} event
     * @returns void
     */
    onBlur(event: any): void {
        this.hasFocus = false;
        this.toggleClass(false, event.currentTarget);
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
}
