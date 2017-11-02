/**
 * 'JsonPointer' class
 *
 * Some utilities for using JSON Pointers with JSON objects
 * https://tools.ietf.org/html/rfc6901
 *
 * get, getFirst, set, setCopy, insert, insertCopy, remove, has, dict,
 * forEachDeep, forEachDeepCopy, escape, unescape, parse, compile, toKey,
 * isJsonPointer, isSubPointer, toIndexedPointer, toGenericPointer,
 * toControlPointer, parseObjectPath
 *
 * Partly based on manuelstofer's json-pointer utilities
 * https://github.com/manuelstofer/json-pointer
 */
export declare type Pointer = string | string[];
export declare class JsonPointer {
    /**
     * 'get' function
     *
     * Uses a JSON Pointer to retrieve a value from an object
     *
     * @param {object} object - Object to get value from
     * @param {Pointer} pointer - JSON Pointer (string or array)
     * @param {number = 0} startSlice - Zero-based index of first Pointer key to use
     * @param {number} endSlice - Zero-based index of last Pointer key to use
     * @param {boolean = false} getBoolean - Return only true or false?
     * @param {boolean = true} errors - Show error if not found?
     * @return {object} - Located value (or true or false if getBoolean = true)
     */
    static get(object: any, pointer: Pointer, startSlice?: number, endSlice?: number, getBoolean?: boolean, errors?: boolean): any;
    /**
     * 'getFirst' function
     *
     * Takes an array of JSON Pointers and objects, and returns the value
     * from the first pointer to find a value in its object.
     *
     * @param {[object, pointer][]} items - array of objects and pointers to check
     * @param {any} defaultValue - Optional value to return if nothing found
     * @return {any} - first set value
     */
    static getFirst(items: any, defaultValue?: any): any;
    /**
     * 'set' function
     *
     * Uses a JSON Pointer to set a value on an object
     *
     * If the optional fourth parameter is TRUE and the inner-most container
     * is an array, the function will insert the value as a new item at the
     * specified location in the array, rather than overwriting the existing value
     *
     * @param {object} object - The object to set value in
     * @param {Pointer} pointer - The JSON Pointer (string or array)
     * @param {any} value - The value to set
     * @return {object} - The original object, modified with the set value
     */
    static set(object: any, pointer: Pointer, value: any, insert?: boolean): any;
    /**
     * 'setCopy' function
     *
     * Copies an object and uses a JSON Pointer to set a value on the copy.
     *
     * If the optional fourth parameter is TRUE and the inner-most container
     * is an array, the function will insert the value as a new item at the
     * specified location in the array, rather than overwriting the existing value.
     *
     * @param {object} object - The object to copy and set value in
     * @param {Pointer} pointer - The JSON Pointer (string or array)
     * @param {any} value - The value to set
     * @return {object} - The new object with the set value
     */
    static setCopy(object: any, pointer: Pointer, value: any, insert?: boolean): any;
    /**
     * 'insert' function
     *
     * Calls 'set' with insert = TRUE
     *
     * @param {object} object - object to insert value in
     * @param {Pointer} pointer - JSON Pointer (string or array)
     * @param {any} value - value to insert
     * @return {object}
     */
    static insert(object: any, pointer: Pointer, value: any): any;
    /**
     * 'insertCopy' function
     *
     * Calls 'setCopy' with insert = TRUE
     *
     * @param {object} object - object to insert value in
     * @param {Pointer} pointer - JSON Pointer (string or array)
     * @param {any} value - value to insert
     * @return {object}
     */
    static insertCopy(object: any, pointer: Pointer, value: any): any;
    /**
     * 'remove' function
     *
     * Uses a JSON Pointer to remove a key and its attribute from an object
     *
     * @param {object} object - object to delete attribute from
     * @param {Pointer} pointer - JSON Pointer (string or array)
     * @return {object}
     */
    static remove(object: any, pointer: Pointer): any;
    /**
     * 'has' function
     *
     * Tests if an object has a value at the location specified by a JSON Pointer
     *
     * @param {object} object - object to chek for value
     * @param {Pointer} pointer - JSON Pointer (string or array)
     * @return {boolean}
     */
    static has(object: any, pointer: Pointer): boolean;
    /**
     * 'dict' function
     *
     * Returns a (pointer -> value) dictionary for an object
     *
     * @param {Object} object - The object to create a dictionary from
     * @return {Object} - The resulting dictionary object
     */
    static dict(object: any): any;
    /**
     * 'forEachDeep' function
     *
     * Iterates over own enumerable properties of an object or items in an array
     * and invokes an iteratee function for each key/value or index/value pair.
     * By default, iterates over items within objects and arrays after calling
     * the iteratee function on the containing object or array itself.
     *
     * The iteratee is invoked with three arguments: (value, pointer, rootObject),
     * where pointer is a JSON pointer indicating the location of the current
     * value within the root object, and rootObject is the root object initially
     * submitted to th function.
     *
     * If a third optional parameter 'bottomUp' is set to TRUE, the iterator
     * function will be called on sub-objects and arrays after being
     * called on their contents, rather than before, which is the default.
     *
     * This function can also optionally be called directly on a sub-object by
     * including optional 4th and 5th parameterss to specify the initial
     * root object and pointer.
     *
     * @param {object} object - the initial object or array
     * @param {(v: any, k?: string, o?: any, p?: any) => any} function - iteratee function
     * @param {boolean = false} bottomUp - optional, set to TRUE to reverse direction
     * @param {object = object} rootObject - optional, root object or array
     * @param {string = ''} pointer - optional, JSON Pointer to object within rootObject
     */
    static forEachDeep(object: any, fn: (v: any, p?: string, o?: any) => any, bottomUp?: boolean, pointer?: string, rootObject?: any): void;
    /**
     * 'forEachDeepCopy' function
     *
     * Similar to forEachDeep, but returns a copy of the original object, with
     * the same keys and indexes, but with values replaced with the result of
     * the iteratee function.
     *
     * @param {object} object - the initial object or array
     * @param {(v: any, k?: string, o?: any, p?: any) => any} function - iteratee function
     * @param {boolean = false} bottomUp - optional, set to TRUE to reverse direction
     * @param {object = object} rootObject - optional, root object or array
     * @param {string = ''} pointer - optional, JSON Pointer to object within rootObject
     */
    static forEachDeepCopy(object: any, fn: (v: any, p?: string, o?: any) => any, bottomUp?: boolean, pointer?: string, rootObject?: any): void;
    /**
     * 'escape' function
     *
     * Escapes a string reference key
     *
     * @param {string} key - string key to escape
     * @return {string} - escaped key
     */
    static escape(key: string): string;
    /**
     * 'unescape' function
     * Unescapes a string reference key
     *
     * @param {string} key - string key to unescape
     * @return {string} - unescaped key
     */
    static unescape(key: string): string;
    /**
     * 'parse' function
     *
     * Converts a string JSON Pointer into a array of keys
     * (if input is already an an array of keys, it is returned unchanged)
     *
     * @param {Pointer} pointer - JSON Pointer (string or array)
     * @return {string[]} - JSON Pointer array of keys
     */
    static parse(pointer: Pointer): string[];
    /**
     * 'compile' function
     *
     * Converts an array of keys into a JSON Pointer string
     * (if input is already a string, it is normalized and returned)
     *
     * The optional second parameter is a default which will replace any empty keys.
     *
     * @param {Pointer} keyArray - JSON Pointer (string or array)
     * @returns {string} - JSON Pointer string
     */
    static compile(keyArray: Pointer, defaultValue?: string | number): string;
    /**
     * 'toKey' function
     *
     * Extracts name of the final key from a JSON Pointer.
     *
     * @param {Pointer} pointer - JSON Pointer (string or array)
     * @returns {string} - the extracted key
     */
    static toKey(pointer: Pointer): string;
    /**
     * 'isJsonPointer' function
     *
     * Checks a string value to determine if it is a valid JSON Pointer.
     * This function only checks for valid JSON Pointer strings, not arrays.
     * (Any array of string values is assumed to be a potentially valid JSON Pointer.)
     *
     * @param {any} value - value to check
     * @returns {boolean} - true if value is a valid JSON Pointer, otherwise false
     */
    static isJsonPointer(value: any): boolean;
    /**
     * 'isSubPointer' function
     *
     * Checks whether one JSON Pointer is a subset of another.
     *
     * @param {Pointer} shortPointer - potential subset JSON Pointer
     * @param {Pointer} longPointer - potential superset JSON Pointer
     * @return {boolean} - true if shortPointer is a subset of longPointer, false if not
     */
    static isSubPointer(shortPointer: Pointer, longPointer: Pointer): boolean;
    /**
     * 'toIndexedPointer' function
     *
     * Merges an array of numeric indexes and a generic pointer to create an
     * indexed pointer for a specific item.
     *
     * For example, merging the generic pointer '/foo/-/bar/-/baz' and
     * the array [4, 2] would result in the indexed pointer '/foo/4/bar/2/baz'
     *
     * @function
     * @param {string | string[]} genericPointer - The generic pointer
     * @param {number[]} indexArray - The array of numeric indexes
     * @param {Map<string, number>} arrayMap - An optional array map
     * @return {string} - The merged pointer with indexes
     */
    static toIndexedPointer(genericPointer: string, indexArray: number[], arrayMap?: Map<string, number>): string;
    /**
     * 'toGenericPointer' function
     *
     * Compares an indexed pointer to an array map and removes list array
     * indexes (but leaves tuple arrray indexes and all object keys, including
     * numeric keys) to create a generic pointer.
     *
     * For example, using the indexed pointer '/foo/1/bar/2/baz/3' and
     * the arrayMap [['/foo', 0], ['/foo/-/bar', 3], ['/foo/-/bar/2/baz', 0]]
     * would result in the generic pointer '/foo/-/bar/2/baz/-'
     * Using the indexed pointer '/foo/1/bar/4/baz/3' and the same arrayMap
     * would result in the generic pointer '/foo/-/bar/-/baz/-'
     *
     * The structure of the arrayMap is: [['path to array', number of tuple items]...]
     *
     * @function
     * @param {Pointer} indexedPointer - The indexed pointer (array or string)
     * @param {Map<string, number>} arrayMap - The optional array map (for preserving tuple indexes)
     * @return {string} - The generic pointer with indexes removed
     */
    static toGenericPointer(indexedPointer: Pointer, arrayMap?: Map<string, number>): string;
    /**
     * 'toControlPointer' function
     *
     * Accepts a JSON Pointer for a data object and returns a JSON Pointer for the
     * matching control in an Angular FormGroup.
     *
     * @param {FormGroup} formGroup - Angular FormGroup to get value from
     * @param {Pointer} dataPointer - JSON Pointer (string or array) to a data object
     * @return {Pointer} - JSON Pointer (string) to the formGroup object
     */
    static toControlPointer(formGroup: any, dataPointer: Pointer): string;
    /**
     * 'parseObjectPath' function
     *
     * Parses a JavaScript object path into an array of keys, which
     * can then be passed to compile() to convert into a string JSON Pointer.
     *
     * Based on mike-marcacci's objectpath parse function:
     * https://github.com/mike-marcacci/objectpath
     *
     * @param {string} path - The object path to parse
     * @return {string[]} - The resulting array of keys
     */
    static parseObjectPath(path: string | string[]): string[];
}
