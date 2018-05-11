import { Directive, ElementRef } from "@angular/core";
import { Renderer, AfterViewInit } from "@angular/core";
import { ElementDef } from "@angular/core/src/view";

@Directive({
    selector: "[float-label]",
    host: {
        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur($event)'
    }
})
export class FloatLabelDirective implements AfterViewInit {
    element: any;
    constructor(private elementRef: ElementRef, private renderer: Renderer) {
    }
    /**
     * Initializing a FloatLabelDirective
     * @returns void
     */
    ngAfterViewInit(): void {
        this.element = this.elementRef.nativeElement;
        this.appendLabel(this.element);
        this.toggleClass(false, this.element, true);
    }
    /**
     * Append an label for input elements
     * @param  {any} element
     * @returns void
     */
    appendLabel(element: any): void {
        setTimeout(() => {
            if (!element.placeholder) {
                this.appendLabel(element);
            } else {
                this.createLabel(element);
            }
        }, 1000)
    }

    createLabel(element: any) {
        let label = this.renderer.createElement(element, "label");
        let elementId = "";
        label.innerText = element.placeholder || '';
        if (element.nodeName === "SELECT") {
            label.innerText = element.getAttribute('data-placeholder') || '';
        }
        if (!element.id) {
            elementId = "id_" + Date.now();
            element.id = elementId;
        }
        this.renderer.setElementAttribute(label, "for", !element.id ? elementId : element.id);
        this.renderer.setElementAttribute(label, "id", "label-class");
        this.renderer.attachViewAfter(element, [label]);
    }
    /**
     * Adding a float label if the element has a Focus
     * @param  {any} event
     * @returns void
     */
    onFocus(event: any): void {
        this.toggleClass(true, event.currentTarget);
    }
    /**
     *  Add or Remove a float label if an element is in out of Focus
     * @param  {any} event
     * @returns void
     */
    onBlur(event: any): void {
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
        if (isInitialize && hasValue || this.addFloatByDefault(element)) {
            parentEleClassList.add("has-float");
            return;
        }
        if (isFocused) {
            if (!parentEleClassList.contains("has-float")) {
                parentEleClassList.add("has-float");
            }
        }
        else {
            if (!hasValue) {
                parentEleClassList.remove("has-float");
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
        if (element.nodeName === "SELECT" || element.type === "date") {
            return true;
        }
        return false;
    }
}