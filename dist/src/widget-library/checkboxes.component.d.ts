import { OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService, CheckboxItem } from '../json-schema-form.service';
export declare class CheckboxesComponent implements OnInit {
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    boundControl: boolean;
    options: any;
    layoutOrientation: string;
    formArray: AbstractControl;
    checkboxList: CheckboxItem[];
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: any): void;
}
