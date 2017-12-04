import { Directive, AfterViewInit, TemplateRef, ViewContainerRef, ElementRef } from "@angular/core";


    @Directive({
        selector: "input[type='text'],input[type='number'],input[type='email'],input[type='password'],select",
        host:{
          '(focus)':'onFocus($event)',
          '(blur)':'onBlur($event)'
        }
        
    })
    export class FloatLabelDirective implements AfterViewInit{
        
        constructor(private elementRef:ElementRef) {
            
        }
        ngAfterViewInit(): void {
            this.toggleClass(false,this.elementRef.nativeElement,true);
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
            if (isInitialize && hasValue || element.nodeName ==="SELECT") {
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
            if (element) {
               return element.value.toString().length > 0;
            }
            return false;
        }
    }