import { PlainObject } from './validator.functions';
/**
 * Utility function library:
 *
 * addClasses, copy, forEach, forEachCopy, hasOwn,
 * mergeFilteredObject, parseText, toTitleCase
*/
/**
 * 'addClasses' function
 *
 * @param {string | string[] | Set<string>} oldClasses
 * @param {string | string[] | Set<string>} newClasses
 * @return {string | string[] | Set<string>} - Combined classes
 */
export declare function addClasses(oldClasses: string | string[] | Set<string>, newClasses: string | string[] | Set<string>): string | string[] | Set<string>;
/**
 * 'copy' function
 *
 * Makes a shallow copy of a JavaScript object, array, Map, or Set.
 * If passed a JavaScript primitive value (string, number, boolean, or null),
 * it returns the value.
 *
 * @param {Object|Array|string|number|boolean|null} object - The object to copy
 * @return {Object|Array|string|number|boolean|null} - The copied object
 */
export declare function copy(object: any): any;
/**
 * 'forEach' function
 *
 * Iterates over all items in the first level of an object or array
 * and calls an iterator funciton on each item.
 *
 * The iterator function is called with four values:
 * 1. The current item's value
 * 2. The current item's key
 * 3. The parent object, which contains the current item
 * 4. The root object
 *
 * Setting the optional third parameter to 'top-down' or 'bottom-up' will cause
 * it to also recursively iterate over items in sub-objects or sub-arrays in the
 * specified direction.
 *
 * @param {Object|Array} object - The object or array to iterate over
 * @param {function} fn - the iterator funciton to call on each item
 * @return {void}
 */
export declare function forEach(object: any, fn: (v: any, k?: string | number, c?: any, rc?: any) => any, recurse?: boolean | string, rootObject?: any): void;
/**
 * 'forEachCopy' function
 *
 * Iterates over all items in the first level of an object or array
 * and calls an iterator function on each item. Returns a new object or array
 * with the same keys or indexes as the original, and values set to the results
 * of the iterator function.
 *
 * Does NOT recursively iterate over items in sub-objects or sub-arrays.
 *
 * @param {Object|Array} object - The object or array to iterate over
 * @param {function} fn - The iterator funciton to call on each item
 * @param {any = null} context - Context in which to call the iterator function
 * @return {Object|Array} - The resulting object or array
 */
export declare function forEachCopy(object: any, fn: (v: any, k?: string | number, o?: any, p?: string) => any): any;
/**
 * 'hasOwn' utility function
 *
 * Checks whether an object has a particular property.
 *
 * @param {any} object - the object to check
 * @param {string} property - the property to look for
 * @return {boolean} - true if object has property, false if not
 */
export declare function hasOwn(object: any, property: string): boolean;
/**
 * 'mergeFilteredObject' utility function
 *
 * Shallowly merges two objects, setting key and values from source object
 * in target object, excluding specified keys.
 *
 * Optionally, it can also use functions to transform the key names and/or
 * the values of the merging object.
 *
 * @param {PlainObject} targetObject - Target object to add keys and values to
 * @param {PlainObject} sourceObject - Source object to copy keys and values from
 * @param {string[]} excludeKeys - Array of keys to exclude
 * @param {(string: string) => string = (k) => k} keyFn - Function to apply to keys
 * @param {(any: any) => any = (v) => v} valueFn - Function to apply to values
 * @return {PlainObject} - Returns targetObject
 */
export declare function mergeFilteredObject(targetObject: PlainObject, sourceObject: PlainObject, excludeKeys?: any[], keyFn?: (string: string) => string, valFn?: (any: any) => any): PlainObject;
/**
 * 'parseText' function
 *
 * @param  {string = ''} text -
 * @param  {any = {}} value -
 * @param  {number = null} index -
 * @return {string} -
 */
export declare function parseText(text?: string, value?: any, values?: any, key?: number | string, tpldata?: any): string;
/**
 * 'toTitleCase' function
 *
 * Intelligently converts an input string to Title Case.
 *
 * Accepts an optional second parameter with a list of additional
 * words and abbreviations to force into a particular case.
 *
 * This function is built on prior work by John Gruber and David Gouch:
 * http://daringfireball.net/2008/08/title_case_update
 * https://github.com/gouch/to-title-case
 *
 * @param {string} input -
 * @param {string|string[]} forceWords? -
 * @return {string} -
 */
export declare function toTitleCase(input: string, forceWords?: string | string[]): string;
