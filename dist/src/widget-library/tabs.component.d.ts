import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export declare class TabsComponent implements OnInit {
    private jsf;
    options: any;
    itemCount: number;
    selectedItem: number;
    showAddTab: boolean;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    select(index: any): void;
    updateControl(): void;
    setTitle(item?: any, index?: number): string;
}
