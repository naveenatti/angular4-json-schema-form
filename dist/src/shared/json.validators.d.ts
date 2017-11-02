import { AbstractControl } from '@angular/forms';
import { SchemaPrimitiveType, PlainObject, IValidatorFn, AsyncIValidatorFn } from './validator.functions';
/**
 * 'JsonValidators' class
 *
 * Provides an extended set of validators to be used by form controls,
 * compatible with standard JSON Schema validation options.
 * http://json-schema.org/latest/json-schema-validation.html
 *
 * Note: This library is designed as a drop-in replacement for the Angular
 * Validators library, and except for one small breaking change to the 'pattern'
 * validator (described below) it can even be imported as a substitute, like so:
 *
 *   import { JsonValidators as Validators } from 'json-validators';
 *
 * and it should work with existing code as a complete replacement.
 *
 * The one exception is the 'pattern' validator, which has been changed to
 * matche partial values by default (the standard 'pattern' validator wrapped
 * all patterns in '^' and '$', forcing them to always match an entire value).
 * However, the old behavior can be restored by simply adding '^' and '$'
 * around your patterns, or by passing an optional second parameter of TRUE.
 * This change is to make the 'pattern' validator match the behavior of a
 * JSON Schema pattern, which allows partial matches, rather than the behavior
 * of an HTML input control pattern, which does not.
 *
 * This library replaces Angular's 4 validators and 1 validator combination
 * function with the following 16 validators and 4 transformation functions:
 *
 * Validators:
 * For all formControls:     required (*), type, enum
 * For text formControls:    minLength (*), maxLength (*), pattern (*), format
 * For numeric formControls: minimum, maximum, multipleOf
 * For formGroup objects:    minProperties, maxProperties, dependencies
 * For formArray arrays:     minItems, maxItems, uniqueItems
 * (Validators originally included with Angular are maked with (*).)
 *
 * NOTE: The dependencies validator is not complete.
 * NOTE: The enum validator does not yet work with objects.
 *
 * Validator transformation functions:
 *   composeAnyOf, composeOneOf, composeAllOf, composeNot
 * (Angular's original combination funciton, 'compose', is also included for
 * backward compatibility, though it is effectively equivalent to composeAllOf,
 * though with a more generic error message.)
 *
 * All validators have also been extended to accept an optional second argument
 * which, if passed a TRUE value, causes the validator to perform the opposite
 * of its original finction. (This is used internally to enable 'not' and
 * 'composeOneOf' to function and return useful error messages.)
 *
 * The 'required' validator has also been overloaded so that if called with
 * a boolean parameter (or no parameters) it returns the original validator
 * function (rather than executing it). However, if it is called with an
 * AbstractControl parameter (as was previously required), it behaves
 * exactly as before.
 *
 * This enables all validators (including 'required') to be constructed in
 * exactly the same way, so they can be automatically applied using the
 * equivalent key names and values taken directly from a JSON Schema.
 *
 * This source code is partially derived from Angular,
 * which is Copyright (c) 2014-2016 Google, Inc.
 * Use of this source code is therefore governed by the same MIT-style license
 * that can be found in the LICENSE file at https://angular.io/license
 */
export declare class JsonValidators {
    /**
     * Validator functions:
     *
     * For all formControls:     required, type, enum
     * For text formControls:    minLength, maxLength, pattern, format
     * For numeric formControls: minimum, maximum, multipleOf
     * For formGroup objects:    minProperties, maxProperties, dependencies
     * For formArray arrays:     minItems, maxItems, uniqueItems
     *
     * TODO: finish dependencies validator
     * TODO: update enum to work with formGroup objects
     */
    /**
     * 'required' validator
     *
     * This validator is overloaded, compared to the default required validator.
     * If called with no parameters, or TRUE, this validator returns the
     * 'required' validator function (rather than executing it). This matches
     * the behavior of all other validators in this library.
     *
     * If this validator is called with an AbstractControl parameter
     * (as was previously required) it behaves the same as Angular's default
     * required validator, and returns an error if the control is empty.
     *
     * Old behavior: (if input type = AbstractControl)
     * @param {AbstractControl} control - required control
     * @return {{[key: string]: boolean}} - returns error message if no input
     *
     * New behavior: (if no input, or input type = boolean)
     * @param {boolean = true} required? - true to validate, false to disable
     * @return {IValidatorFn} - returns the 'required' validator function itself
     */
    static required(input: AbstractControl): PlainObject;
    static required(input?: boolean): IValidatorFn;
    /**
     * 'type' validator
     *
     * Requires a control to only accept values of a specified type,
     * or one of an array of types.
     *
     * Note: SchemaPrimitiveType = 'string'|'number'|'integer'|'boolean'|'null'
     *
     * @param {SchemaPrimitiveType | SchemaPrimitiveType[]} type - type(s) to accept
     * @return {IValidatorFn}
     */
    static type(type: SchemaPrimitiveType | SchemaPrimitiveType[]): IValidatorFn;
    /**
     * 'enum' validator
     *
     * Requires a control to have a value from an enumerated list of values.
     *
     * Converts types as needed to allow string inputs to still correctly
     * match number, boolean, and null enum values.
     * (toJavaScriptType() can be used later to convert these string values.)
     *
     * TODO: modify to work with objects
     *
     * @param {any[]} enumList - array of acceptable values
     * @return {IValidatorFn}
     */
    static enum(enumList: any[]): IValidatorFn;
    /**
     * 'minLength' validator
     *
     * Requires a control's text value to be greater than a specified length.
     *
     * @param {number} requiredLength - minimum allowed string length
     * @param {boolean = false} invert - instead return error object only if valid
     * @return {IValidatorFn}
     */
    static minLength(requiredLength: number): IValidatorFn;
    /**
     * 'maxLength' validator
     *
     * Requires a control's text value to be less than a specified length.
     *
     * @param {number} requiredLength - maximum allowed string length
     * @param {boolean = false} invert - instead return error object only if valid
     * @return {IValidatorFn}
     */
    static maxLength(requiredLength: number): IValidatorFn;
    /**
     * 'pattern' validator
     *
     * Note: NOT the same as Angular's default pattern validator.
     * Requires a control's value to match a specified regular expression pattern.
     *
     * This validator changes the behavior of default pattern validator
     * by replacing RegExp(`^${pattern}$`) with RegExp(`${pattern}`),
     * which allows for partial matches.
     *
     * To return to the default funcitonality, and match the entire string,
     * pass TRUE as the optional second parameter.
     *
     * @param {string} pattern - regular expression pattern
     * @param {boolean = false} wholeString - match whole value string?
     * @return {IValidatorFn}
     */
    static pattern(pattern: string, wholeString?: boolean): IValidatorFn;
    /**
     * 'format' validator
     *
     * Requires a control to have a value of a certain format.
     *
     * This validator currently checks the following formsts:
     * 'date-time'|'email'|'hostname'|'ipv4'|'ipv6'|'uri'
     *
     * TODO: add 'regex' and 'color' formats
     *
     * @param {'date-time'|'email'|'hostname'|'ipv4'|'ipv6'|'uri'} format - format to check
     * @return {IValidatorFn}
     */
    static format(format: 'date-time' | 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'uri' | 'url' | 'color'): IValidatorFn;
    /**
     * 'minimum' validator
     *
     * Requires a control to have a numeric value not greater than
     * a specified minimum amount.
     *
     * The optional second parameter indicates whether the valid range excludes
     * the minimum value. It defaults to false, and includes the minimum.
     *
     * @param {number} minimum - minimum allowed value
     * @param {boolean = false} exclusiveMinimum - include minimum value itself?
     * @return {IValidatorFn}
     */
    static minimum(minimum: number, exclusiveMinimum?: boolean): IValidatorFn;
    /**
     * 'maximum' validator
     *
     * Requires a control to have a numeric value not less than
     * a specified maximum amount.
     *
     * The optional second parameter indicates whether the valid range excludes
     * the maximum value. It defaults to false, and includes the maximum.
     *
     * @param {number} maximum - maximum allowed value
     * @param {boolean = false} exclusiveMaximum - include maximum value itself?
     * @return {IValidatorFn}
     */
    static maximum(maximum: number, exclusiveMaximum?: boolean): IValidatorFn;
    /**
     * 'multipleOf' validator
     *
     * Requires a control to have a numeric value that is a multiple
     * of a specified number.
     *
     * @param {number} multipleOf - number value must be a multiple of
     * @return {IValidatorFn}
     */
    static multipleOf(multipleOf: number): IValidatorFn;
    /**
     * 'minProperties' validator
     *
     * Requires a form group to have a minimum number of properties (i.e. have
     * values entered in a minimum number of controls within the group).
     *
     * @param {number} minProperties - minimum number of properties allowed
     * @return {IValidatorFn}
     */
    static minProperties(minProperties: number): IValidatorFn;
    /**
     * 'maxProperties' validator
     *
     * Requires a form group to have a maximum number of properties (i.e. have
     * values entered in a maximum number of controls within the group).
     *
     * Note: Has no effect if the form group does not contain more than the
     * maximum number of controls.
     *
     * @param {number} maxProperties - maximum number of properties allowed
     * @return {IValidatorFn}
     */
    static maxProperties(maxProperties: number): IValidatorFn;
    /**
     * 'dependencies' validator
     *
     * Requires the controls in a form group to meet additional validation
     * criteria, depending on the values of other controls in the group.
     *
     * Examples:
     * https://spacetelescope.github.io/understanding-json-schema/reference/object.html#dependencies
     *
     * @param {any} dependencies - required dependencies
     * @return {IValidatorFn}
     */
    static dependencies(dependencies: any): IValidatorFn;
    /**
     * 'minItems' validator
     *
     * Requires a form array to have a minimum number of values.
     *
     * @param {number} minItems - minimum number of items allowed
     * @return {IValidatorFn}
     */
    static minItems(minItems: number): IValidatorFn;
    /**
     * 'maxItems' validator
     *
     * Requires a form array to have a maximum number of values.
     *
     * @param {number} maxItems - maximum number of items allowed
     * @return {IValidatorFn}
     */
    static maxItems(maxItems: number): IValidatorFn;
    /**
     * 'uniqueItems' validator
     *
     * Requires values in a form array to be unique.
     *
     * @param {boolean = true} unique? - true to validate, false to disable
     * @return {IValidatorFn}
     */
    static uniqueItems(unique?: boolean): IValidatorFn;
    /**
     * No-op validator. Included for backward compatibility.
     */
    static nullValidator(c: AbstractControl): PlainObject;
    /**
     * Validator transformation functions:
     * composeAnyOf, composeOneOf, composeAllOf, composeNot,
     * compose, composeAsync
     *
     * TODO: Add composeAnyOfAsync, composeOneOfAsync,
     *           composeAllOfAsync, composeNotAsync
     */
    /**
     * 'composeAnyOf' validator combination function
     *
     * Accepts an array of validators and returns a single validator that
     * evaluates to valid if any one or more of the submitted validators are
     * valid. If every validator is invalid, it returns combined errors from
     * all validators.
     *
     * @param {IValidatorFn[]} validators - array of validators to combine
     * @return {IValidatorFn} - single combined validator function
     */
    static composeAnyOf(validators: IValidatorFn[]): IValidatorFn;
    /**
     * 'composeOneOf' validator combination function
     *
     * Accepts an array of validators and returns a single validator that
     * evaluates to valid only if exactly one of the submitted validators
     * is valid. Otherwise returns combined information from all validators,
     * both valid and invalid.
     *
     * @param {IValidatorFn[]} validators - array of validators to combine
     * @return {IValidatorFn} - single combined validator function
     */
    static composeOneOf(validators: IValidatorFn[]): IValidatorFn;
    /**
     * 'composeAllOf' validator combination function
     *
     * Accepts an array of validators and returns a single validator that
     * evaluates to valid only if all the submitted validators are individually
     * valid. Otherwise it returns combined errors from all invalid validators.
     *
     * @param {IValidatorFn[]} validators - array of validators to combine
     * @return {IValidatorFn} - single combined validator function
     */
    static composeAllOf(validators: IValidatorFn[]): IValidatorFn;
    /**
     * 'composeNot' validator inversion function
     *
     * Accepts a single validator function and inverts its result.
     * Returns valid if the submitted validator is invalid, and
     * returns invalid if the submitted validator is valid.
     * (Note: this function can itself be inverted
     * - e.g. composeNot(composeNot(validator)) -
     * but this can be confusing and is therefore not recommended.)
     *
     * @param {IValidatorFn[]} validators - validator(s) to invert
     * @return {IValidatorFn} - new validator function that returns opposite result
     */
    static composeNot(validator: IValidatorFn): IValidatorFn;
    /**
     * 'compose' validator combination function
     *
     * @param {IValidatorFn[]} validators - array of validators to combine
     * @return {IValidatorFn} - single combined validator function
     */
    static compose(validators: IValidatorFn[]): IValidatorFn;
    /**
     * 'composeAsync' async validator combination function
     *
     * @param {AsyncIValidatorFn[]} async validators - array of async validators
     * @return {AsyncIValidatorFn} - single combined async validator function
     */
    static composeAsync(validators: AsyncIValidatorFn[]): AsyncIValidatorFn;
}
