export declare class RootComponent {
    options: any;
    formID: number;
    dataIndex: number[];
    layoutIndex: number[];
    layout: any[];
    isOrderable: boolean;
    isFlexItem: boolean;
    isDraggable(node: any): boolean;
    getFlexAttribute(node: any, attribute: string): any;
    trackByItem(layoutItem: any): any;
}
