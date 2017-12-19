import { Directive, ElementRef } from "@angular/core";
import { Renderer , AfterViewInit} from "@angular/core";
import { ElementDef } from "@angular/core/src/view";

    @Directive({
        selector: "[float-label]",
        host:{
          '(focus)':'onFocus($event)',
          '(blur)':'onBlur($event)'
        }
    })
    export class FloatLabelDirective implements AfterViewInit{
      
        element: any;
        constructor(private elementRef:ElementRef,private renderer:Renderer) {
            
        }
        ngAfterViewInit(): void {
            this.element = this.elementRef.nativeElement;
            this.appendLabel(this.element);
            this.toggleClass(false, this.element, true);
            
        }
        appendLabel(element: any) {
            setTimeout(() => {
                let label = this.renderer.createElement(element, "label");
                let elementId = "";
                label.innerText = element.placeholder || "";
                if (element.nodeName === "SELECT") {
                    label.innerText ="Select "+ element.name[0].toUpperCase()+element.name.slice(1) || "Select";
                }
                if (!element.id) {
                    elementId = "id_" + Date.now();
                    element.id = elementId;
                }
                this.renderer.setElementAttribute(label, "for", !element.id ? elementId : element.id);
                this.renderer.setElementAttribute(label, "id", "label-class");
                this.renderer.attachViewAfter(element, [label]);
            },0)
        }
        onFocus(event:any){
          this.toggleClass(true,event.currentTarget);
        }
        onBlur(event:any){
            this.toggleClass(false,event.currentTarget);
        }
    
        toggleClass(isFocused: boolean, element: any, isInitialize?: boolean): void {
            let parentEleClassList = element.parentElement.classList;
            let hasValue = this.checkValue(element);
            if (isInitialize && hasValue) {
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
    
        checkValue(element: any): boolean {
            if (element.nodeName === "SELECT") {
                return element["0"];
            }
            if (element) {
               return element.value.toString().length > 0;
            }
            return false;
        }
    }