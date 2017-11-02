import { ChangeDetectorRef, OnChanges, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
/**
 * Bootstrap 3 framework for Angular JSON Schema Form.
 *
 */
export declare class Bootstrap3FrameworkComponent implements OnInit, OnChanges {
    changeDetector: ChangeDetectorRef;
    jsf: JsonSchemaFormService;
    controlInitialized: boolean;
    widgetOptions: any;
    layoutPointer: string;
    widgetLayoutNode: any;
    options: any;
    formControl: any;
    debugOutput: any;
    debug: any;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(changeDetector: ChangeDetectorRef, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    ngOnChanges(): void;
    initializeControl(): void;
    updateHelpBlock(value: any): void;
    updateArrayItems(): void;
    setTitle(): string;
    removeItem(): void;
}
