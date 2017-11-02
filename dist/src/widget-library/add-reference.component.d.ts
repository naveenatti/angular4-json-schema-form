import { DoCheck, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export declare class AddReferenceComponent implements OnInit, DoCheck {
    private jsf;
    options: any;
    itemCount: number;
    showAddButton: boolean;
    previousLayoutIndex: number[];
    previousDataIndex: number[];
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    ngDoCheck(): void;
    addItem(event: any): void;
    updateControl(): void;
    setTitle(): string;
}
