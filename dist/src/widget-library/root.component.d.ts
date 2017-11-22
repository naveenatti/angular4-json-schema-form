import { JsonSchemaFormService } from '../json-schema-form.service';
export declare class RootComponent {
    private jsf;
    options: any;
    dataIndex: number[];
    layoutIndex: number[];
    layout: any[];
    isOrderable: boolean;
    isFlexItem: boolean;
    constructor(jsf: JsonSchemaFormService);
    isDraggable(node: any): boolean;
    getFlexAttribute(node: any, attribute: string): any;
    trackByItem(layoutItem: any): any;
    isConditionallyShown(layoutNode: any): boolean;
}
