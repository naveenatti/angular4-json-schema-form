import { ChangeDetectorRef, OnChanges, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
export declare class MaterialDesignFrameworkComponent implements OnInit, OnChanges {
    private changeDetector;
    private jsf;
    controlInitialized: boolean;
    controlType: string;
    inputType: string;
    options: any;
    widgetLayoutNode: any;
    widgetOptions: any;
    layoutPointer: string;
    formControl: any;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(changeDetector: ChangeDetectorRef, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    ngOnChanges(): void;
    initializeControl(): void;
    setTitle(): string;
}
