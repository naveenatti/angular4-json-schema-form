import { ElementRef, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
/**
 * OrderableDirective
 *
 * Enables array elements to be reordered by dragging and dropping.
 *
 * Only works for arrays that have at least two elements.
 *
 * Also detects arrays-within-arrays, and correctly moves either
 * the child array element or the parent array element,
 * depending on the drop targert.
 *
 */
export declare class OrderableDirective implements OnInit {
    private elementRef;
    private jsf;
    arrayPointer: string;
    listen: boolean;
    element: any;
    overParentElement: boolean;
    overChildElement: boolean;
    orderable: boolean;
    formID: number;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(elementRef: ElementRef, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    /**
     * Listeners for movable element being dragged:
     *
     * dragstart: add 'dragging' class to element, set effectAllowed = 'move'
     * dragover: set dropEffect = 'move'
     * dragend: remove 'dragging' class from element
     */
    onDragStart(event: any): void;
    onDragOver(event: any): boolean;
    onDragEnd(event: any): void;
    /**
     * Listeners for stationary items being dragged over:
     *
     * dragenter: add 'drag-target-...' classes to element
     * dragleave: remove 'drag-target-...' classes from element
     * drop: remove 'drag-target-...' classes from element, move dropped array item
     */
    onDragEnter(event: any): boolean;
    onDragLeave(event: any): void;
    onDrop(event: any): boolean;
}
