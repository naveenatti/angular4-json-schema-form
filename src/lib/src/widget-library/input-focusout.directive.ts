import { Directive, ElementRef, HostListener } from '@angular/core';


// tslint:disable-next-line:directive-selector
@Directive({ selector: 'input' })
export class InputFocusOutDirective {
    constructor(private element: ElementRef) {

    }

    @HostListener('keyup', ['$event']) onKeyUp(event: any) {
        if (event.which === 13) {
            this.element.nativeElement.blur();
        }
    }
}