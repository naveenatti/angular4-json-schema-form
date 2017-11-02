import { OnInit } from '@angular/core';
export declare class FlexLayoutSectionComponent implements OnInit {
    options: any;
    expanded: boolean;
    containerType: string;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    ngOnInit(): void;
    legendDisplay(): string;
    expand(): void;
    getFlexAttribute(attribute: string): any;
}
