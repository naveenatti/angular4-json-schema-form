import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export declare class MessageComponent implements OnInit {
    private jsf;
    options: any;
    message: string;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
}
