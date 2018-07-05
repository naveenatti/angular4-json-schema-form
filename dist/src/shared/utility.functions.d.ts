import { PlainObject } from './validator.functions';
export declare function addClasses(oldClasses: string | string[] | Set<string>, newClasses: string | string[] | Set<string>): string | string[] | Set<string>;
export declare function copy(object: any, errors?: boolean): any;
export declare function forEach(object: any, fn: (v: any, k?: string | number, c?: any, rc?: any) => any, recurse?: boolean | string, rootObject?: any, errors?: boolean): void;
export declare function forEachCopy(object: any, fn: (v: any, k?: string | number, o?: any, p?: string) => any, errors?: boolean): any;
export declare function hasOwn(object: any, property: string): boolean;
export declare function mergeFilteredObject(targetObject: PlainObject, sourceObject: PlainObject, excludeKeys?: any[], keyFn?: (string: string) => string, valFn?: (any: any) => any): PlainObject;
export declare function uniqueItems(...items: any[]): string[];
export declare function commonItems(...arrays: any[]): string[];
export declare function fixTitle(name: string): string;
export declare function toTitleCase(input: string, forceWords?: string | string[]): string;
