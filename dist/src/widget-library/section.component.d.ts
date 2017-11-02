import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export declare class SectionComponent implements OnInit {
    private jsf;
    options: any;
    expanded: boolean;
    containerType: string;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    legendDisplay(): string;
    expand(): void;
    getFlexAttribute(attribute: string): any;
}
