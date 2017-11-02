/**
 * Layout function library:
 *
 * buildLayout:            Builds a complete layout from an input layout and schema
 *
 * buildLayoutFromSchema:  Builds a complete layout entirely from an input schema
 *
 * mapLayout:
 *
 * buildTitleMap:
 */
/**
 * 'buildLayout' function
 *
 * @param {any} jsf
 * @return {any[]}
 */
export declare function buildLayout(jsf: any, widgetLibrary: any): any[];
/**
 * 'buildLayoutFromSchema' function
 *
 * @param {any} jsf -
 * @param {number = 0} layoutIndex -
 * @param {string = ''} layoutPointer -
 * @param {string = ''} schemaPointer -
 * @param {string = ''} dataPointer -
 * @param {boolean = false} arrayItem -
 * @param {string = null} arrayItemType -
 * @param {boolean = null} removable -
 * @param {boolean = false} forRefLibrary -
 * @return {any}
 */
export declare function buildLayoutFromSchema(jsf: any, widgetLibrary: any, layoutPointer?: string, schemaPointer?: string, dataPointer?: string, arrayItem?: boolean, arrayItemType?: string, removable?: boolean, forRefLibrary?: boolean): any;
/**
 * 'mapLayout' function
 *
 * Creates a new layout by running each element in an existing layout through
 * an iteratee. Recursively maps within array elements 'items' and 'tabs'.
 * The iteratee is invoked with four arguments: (value, index, layout, path)
 *
 * THe returned layout may be longer (or shorter) then the source layout.
 *
 * If an item from the source layout returns multiple items (as '*' usually will),
 * this function will keep all returned items in-line with the surrounding items.
 *
 * If an item from the source layout causes an error and returns null, it is
 * simply skipped, and the function will still return all non-null items.
 *
 * @param {any[]} layout - the layout to map
 * @param {(v: any, i?: number, l?: any, p?: string) => any}
 *   function - the funciton to invoke on each element
 * @param {any = ''} layoutPointer - the layoutPointer to layout, inside rootLayout
 * @param {any[] = layout} rootLayout - the root layout, which conatins layout
 * @return {[type]}
 */
export declare function mapLayout(layout: any[], fn: (v: any, i?: number, p?: string, l?: any) => any, layoutPointer?: string, rootLayout?: any[]): any[];
/**
 * 'buildTitleMap' function
 *
 * @param {any} titleMap -
 * @param {any} enumList -
 * @param {boolean = false} fieldRequired -
 * @return {{name: string, value: any}[]}
 */
export declare function buildTitleMap(titleMap: any, enumList: any, fieldRequired?: boolean): {
    name: string;
    value: any;
}[];
