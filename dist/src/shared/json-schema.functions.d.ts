import { Pointer } from './jsonpointer.functions';
/**
 * JSON Schema function library:
 *
 * buildSchemaFromLayout:   TODO: Write this function
 *
 * buildSchemaFromData:
 *
 * getFromSchema:
 *
 * getSchemaReference:
 *
 * getInputType:
 *
 * checkInlineType:
 *
 * isInputRequired:
 *
 * updateInputOptions:
 *
 * getControlValidators:
 */
/**
 * 'buildSchemaFromLayout' function
 *
 * Build a JSON Schema from a JSON Form layout
 *
 * @param {any[]} layout - The JSON Form layout
 * @return {JSON Schema} - The new JSON Schema
 */
export declare function buildSchemaFromLayout(layout: any[]): any;
/**
 * 'buildSchemaFromData' function
 *
 * Build a JSON Schema from a data object
 *
 * @param {any} data - The data object
 * @return {JSON Schema} - The new JSON Schema
 */
export declare function buildSchemaFromData(data: any, requireAllFields?: boolean, isRoot?: boolean): any;
/**
 * 'getFromSchema' function
 *
 * Uses a JSON Pointer for a data object to retrieve a sub-schema from
 * a JSON Schema which describes that data object
 *
 * @param {JSON Schema} schema - The schema to get the sub-schema from
 * @param {Pointer} dataPointer - JSON Pointer (string or array)
 * @param {boolean = false} returnContainer - Return containing object instead?
 * @return {schema} - The located sub-schema
 */
export declare function getFromSchema(schema: any, dataPointer: Pointer, returnContainer?: boolean): any;
/**
 * 'getSchemaReference' function
 *
 * Return the sub-section of a schema referred to
 * by a JSON Pointer or '$ref' object.
 *
 * @param {object} schema - The schema to return a sub-section from
 * @param {string|object} reference - JSON Pointer or '$ref' object
 * @param {object} schemaRefLibrary - Optional library of resolved refernces
 * @param {object} recursiveRefMap - Optional map of recursive links
 * @return {object} - The refernced schema sub-section
 */
export declare function getSchemaReference(schema: any, reference: any, schemaRefLibrary?: any, recursiveRefMap?: Map<string, string>): any;
/**
 * 'resolveRecursiveReferences' function
 *
 * Checks a JSON Pointer against a map of recursive references and returns
 * a JSON Pointer to the shallowest equivalent location in the same object.
 *
 * Using this functions enables an object to be constructed with unlimited
 * recursion, while maintaing a fixed set of metadata, such as field data types.
 * The object can grow as large as it wants, and deeply recursed nodes can
 * just refer to the metadata for their shallow equivalents, instead of having
 * to add additional redundant metadata for each recursively added node.
 *
 * Example:
 *
 * pointer:         '/stuff/and/more/and/more/and/more/and/more/stuff'
 * recursiveRefMap: [['/stuff/and/more/and/more', '/stuff/and/more/']]
 * returned:        '/stuff/and/more/stuff'
 *
 * @param  {Pointer} pointer -
 * @param  {Map<string, string>} recursiveRefMap -
 * @param  {Map<string, number>} arrayMap - optional
 * @return {string} -
 */
export declare function resolveRecursiveReferences(pointer: Pointer, recursiveRefMap: Map<string, string>, arrayMap?: Map<string, number>): string;
/**
 * 'getInputType' function
 *
 * @param {any} schema
 * @return {string}
 */
export declare function getInputType(schema: any, layoutNode?: any): string;
/**
 * 'checkInlineType' function
 *
 * @param {string} controlType -
 * @param {JSON Schema} schema -
 * @return {string}
 */
export declare function checkInlineType(controlType: string, schema: any, layoutNode?: any): string;
/**
 * 'isInputRequired' function
 *
 * Checks a JSON Schema to see if an item is required
 *
 * @param {schema} schema - the schema to check
 * @param {string} key - the key of the item to check
 * @return {boolean} - true if the item is required, false if not
 */
export declare function isInputRequired(schema: any, pointer: string): boolean;
/**
 * 'updateInputOptions' function
 *
 * @param {any} layoutNode
 * @param {any} schema
 * @return {void}
 */
export declare function updateInputOptions(layoutNode: any, schema: any, jsf: any): void;
/**
 * 'getControlValidators' function
 *
 * @param {schema} schema
 * @return {validators}
 */
export declare function getControlValidators(schema: any): any;
