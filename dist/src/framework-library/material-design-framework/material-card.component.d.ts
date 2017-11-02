import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
export declare class MaterialCardComponent implements OnInit {
    private jsf;
    options: any;
    expanded: boolean;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    expand(): void;
}
