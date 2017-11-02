import { OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService, CheckboxItem } from '../../json-schema-form.service';
export declare class MaterialCheckboxesComponent implements OnInit {
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    horizontalList: boolean;
    formArray: AbstractControl;
    checkboxList: CheckboxItem[];
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    readonly allChecked: boolean;
    readonly someChecked: boolean;
    updateValue(event: any): void;
    updateAllValues(event: any): void;
}
