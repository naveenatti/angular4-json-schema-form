import { ChangeDetectorRef, OnChanges, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export declare class NoFrameworkComponent implements OnInit, OnChanges {
    private changeDetector;
    private jsf;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(changeDetector: ChangeDetectorRef, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    ngOnChanges(): void;
}
