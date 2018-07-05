import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
export declare class FlexLayoutRootComponent implements OnInit {
    private jsf;
    dataIndex: number[];
    layoutIndex: number[];
    layout: any[];
    isFlexItem: boolean;
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    getFlexAttribute(node: any, attribute: string): any;
    trackByItem(layoutNode: any): any;
    removeItem(item: any): void;
    isConditionallyShown(layoutNode: any): boolean;
}
