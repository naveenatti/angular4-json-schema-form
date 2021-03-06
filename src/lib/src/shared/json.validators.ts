import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operator/map';

import isEqual from 'lodash-es/isEqual';

import {
  _executeValidators, _executeAsyncValidators, _mergeObjects, _mergeErrors,
  isEmpty, isDefined, hasValue, isString, isNumber, isBoolean, isArray,
  getType, isType, toJavaScriptType, toObservable, xor, SchemaPrimitiveType,
  PlainObject, IValidatorFn, AsyncIValidatorFn
} from './validator.functions';
import { forEachCopy } from './utility.functions';
import { jsonSchemaFormatTests, JsonSchemaFormatNames } from './format-regex.constants';
import moment from 'moment';

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
 * This library replaces Angular's validators and combination functions
 * with the following validators and transformation functions:
 *
 * Validators:
 *   For all formControls:     required (*), type, enum, const
 *   For text formControls:    minLength (*), maxLength (*), pattern (*), format
 *   For numeric formControls: maximum, exclusiveMaximum,
 *                             minimum, exclusiveMinimum, multipleOf
 *   For formGroup objects:    minProperties, maxProperties, dependencies
 *   For formArray arrays:     minItems, maxItems, uniqueItems, contains
 *   Not used by JSON Schema:  min (*), max (*), requiredTrue (*), email (*)
 * (Validators originally included with Angular are maked with (*).)
 *
 * NOTE / TODO: The dependencies validator is not complete.
 * NOTE / TODO: The contains validator is not complete.
 *
 * Validators not used by JSON Schema (but included for compatibility)
 * and their JSON Schema equivalents:
 *
 *   Angular validator | JSON Schema equivalent
 *   ------------------|-----------------------
 *     min(number)     |   minimum(number)
 *     max(number)     |   maximum(number)
 *     requiredTrue()  |   const(true)
 *     email()         |   format('email')
 *
 * Validator transformation functions:
 *   composeAnyOf, composeOneOf, composeAllOf, composeNot
 * (Angular's original combination funciton, 'compose', is also included for
 * backward compatibility, though it is functionally equivalent to composeAllOf,
 * asside from its more generic error message.)
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
 * which is Copyright (c) 2014-2017 Google, Inc.
 * Use of this source code is therefore governed by the same MIT-style license
 * that can be found in the LICENSE file at https://angular.io/license
 *
 * Original Angular Validators:
 * https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts
 */
export class JsonValidators {

  /**
   * Validator functions:
   *
   * For all formControls:     required, type, enum, const
   * For text formControls:    minLength, maxLength, pattern, format
   * For numeric formControls: maximum, exclusiveMaximum,
   *                           minimum, exclusiveMinimum, multipleOf
   * For formGroup objects:    minProperties, maxProperties, dependencies
   * For formArray arrays:     minItems, maxItems, uniqueItems, contains
   *
   * TODO: finish dependencies validator
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
  static required(input: AbstractControl): ValidationErrors | null;
  static required(input?: boolean): IValidatorFn;

  static required(input?: AbstractControl | boolean): ValidationErrors | null | IValidatorFn {
    if (input === undefined) { input = true; }
    switch (input) {
      case true: // Return required function (do not execute it yet)
        return (control: AbstractControl, invert = false): ValidationErrors | null => {
          if (invert) { return null; } // if not required, always return valid
          return hasValue(control.value) ? null : { 'required': true };
        };
      case false: // Do nothing (if field is not required, it is always valid)
        return JsonValidators.nullValidator;
      default: // Execute required function
        return hasValue((<AbstractControl>input).value) ? null : { 'required': true };
    }
  };

  /**
   * 'type' validator
   *
   * Requires a control to only accept values of a specified type,
   * or one of an array of types.
   *
   * Note: SchemaPrimitiveType = 'string'|'number'|'integer'|'boolean'|'null'
   *
   * @param {SchemaPrimitiveType|SchemaPrimitiveType[]} type - type(s) to accept
   * @return {IValidatorFn}
   */
  static type(requiredType: SchemaPrimitiveType | SchemaPrimitiveType[]): IValidatorFn {
    if (!hasValue(requiredType)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      const currentValue: any = control.value;
      const isValid = isArray(requiredType) ?
        (<SchemaPrimitiveType[]>requiredType).some(type => isType(currentValue, type)) :
        isType(currentValue, <SchemaPrimitiveType>requiredType);
      return xor(isValid, invert) ?
        null : { 'type': { requiredType, currentValue } };
    };
  }

  /**
   * 'enum' validator
   *
   * Requires a control to have a value from an enumerated list of values.
   *
   * Converts types as needed to allow string inputs to still correctly
   * match number, boolean, and null enum values.
   *
   * @param {any[]} allowedValues - array of acceptable values
   * @return {IValidatorFn}
   */
  static enum(allowedValues: any[]): IValidatorFn {
    if (!isArray(allowedValues)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      const currentValue: any = control.value;
      const IsEqual = (enumValue, inputValue) =>
        enumValue === inputValue ||
        (isNumber(enumValue) && +inputValue === +enumValue) ||
        (isBoolean(enumValue, 'strict') &&
          toJavaScriptType(inputValue, 'boolean') === enumValue) ||
        (enumValue === null && !hasValue(inputValue)) ||
        isEqual(enumValue, inputValue);
      const isValid = isArray(currentValue) ?
        currentValue.every(inputValue => allowedValues.some(enumValue =>
          IsEqual(enumValue, inputValue)
        )) :
        allowedValues.some(enumValue => IsEqual(enumValue, currentValue));
      return xor(isValid, invert) ?
        null : { 'enum': { allowedValues, currentValue } };
    };
  }

  /**
   * 'const' validator
   *
   * Requires a control to have a specific value.
   *
   * Converts types as needed to allow string inputs to still correctly
   * match number, boolean, and null values.
   *
   * TODO: modify to work with objects
   *
   * @param {any[]} requiredValue - required value
   * @return {IValidatorFn}
   */
  static const(requiredValue: any): IValidatorFn {
    if (!hasValue(requiredValue)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      const currentValue: any = control.value;
      const isEqual = (constValue, inputValue) =>
        constValue === inputValue ||
        isNumber(constValue) && +inputValue === +constValue ||
        isBoolean(constValue, 'strict') &&
        toJavaScriptType(inputValue, 'boolean') === constValue ||
        constValue === null && !hasValue(inputValue);
      const isValid = isEqual(requiredValue, currentValue);
      return xor(isValid, invert) ?
        null : { 'const': { requiredValue, currentValue } };
    };
  }

  /**
   * 'equalTo' validator
   *
   * Note: NOT the same as Angular's default equalTo validator.
   *
   * Requires a control's value to match a specified equalTo control value.
   *
   * This validator validate the two control values
   * which allows for partial matches.
   *
   * To return to the default funcitonality, and match the entire string,
   *
   * @param {string} equalField - value to match a specified equalTo control value
   * @return {IValidatorFn}
   */
  static equalTo(equalField: string): IValidatorFn {
    if (!hasValue(equalField)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentValue: string = control.value;
      let isValid = isString(currentValue) ? (control.parent && control.parent.value && control.parent.value[equalField] === currentValue)
        : false;
      return xor(isValid, invert) ?
        null : { 'equalTo': { equalField, currentValue } };
    };
  }

  /**
  * 'DOB' validator
  *
  * Note: NOT the same as Angular's default equalTo validator.
  *
  * Requires a control's value to match a specified equalTo control value.
  *
  * This validator validate the DOB control values
  * which allows for minimu age matches.
  *
  * To return to the default funcitonality, and match the entire string,
  *
  * @param {string} equalField - value to match a specified equalTo control value
  * @return {IValidatorFn}
  */
  static dobFormat(dobFormat: string, wholeString = false): IValidatorFn {
    if (!hasValue(dobFormat)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (control.value === undefined || control.value === ''|| control.value === null || control.value instanceof Array) {
        return undefined;
      }
      let value = control.value;
      if (value && value.length === 0) {
        return undefined;
      }
      if (typeof dobFormat === 'string') {
      }
      // tslint:disable-next-line:max-line-length
      const datepattern = /^(?:(?:31(|-|)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec|jan|mar|may|jul|aug|oct|dec|JAN|MAR|MAY|JUL|AUG|OCT|DEC)))\1|(?:(?:29|30)(|-|)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|jan|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|JAN|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))\2))(?:(?:1[6-9]|[2-9]\d)?\d{4})$|^(?:29(|-|)(?:0?2|(?:Feb|feb|FEB))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(|-|)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|jan|feb|mar|apr|may|jun|jul|aug|sep|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP))|(?:1[0-2]|(?:Oct|Nov|Dec|oct|nov|dec|OCT|NOV|DEC)))\4(?:(?:1[6-9]|[2-9]\d)?\d{4})$/;
      if (value && value._i && (typeof value._i === 'object')) {
        value = moment(value._d).format('DD-MMM-YYYY');
      } else if (value && value._i && (typeof value._i === 'string') && value._i.length > 11) {
        value = moment(value._i).format('DD-MMM-YYYY');
      } else if (value && value._i && (typeof value._i === 'string')) {
        value = value._i;
      } else if (value && !value._i && (typeof value === 'object')) {
        value = moment(value).format('DD-MMM-YYYY');
      } else if (value && !value._i && value.length === 10
        && value.split('-')[0] && value.split('-')[0].length === 4) {
        value = moment(value, 'YYYY-MM-DD').format('DD-MMM-YYYY');
      }
      if (!(new RegExp(datepattern).test(value))) {
        return { 'dateValidation': true };
      } else {
        /* This method used for configuring date option for Date of birth
        * disable Date should be less than 18 years
        */
        if (value && value.length >= 10) {
          const characterCheck = /[a-zA-z]/;
          let dateOfBirth = '';
          // tslint:disable-next-line:prefer-conditional-expression
          if (characterCheck.test(value[3])) {
            dateOfBirth = moment(value, 'DD-MMM-YYYY').format('DD-MM-YYYY');
          } else {
            dateOfBirth = value;
          }
          const dateParts = dateOfBirth.split('-');
          if (dateParts[2] && dateParts[2].length === 4 && dobFormat != 'noEighteenYearsValidation') {
            const eighteenYearsBeforeNow = new Date(+dateParts[2] + 18, +dateParts[1] - 1, +dateParts[0]) <= new Date();
            if (!eighteenYearsBeforeNow) {
              return { 'eighteenYearsValidation': true };
            }
          } else if (dateParts[2] && dateParts[2].length === 4) {
            const dateOfBirthBeforeNow = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]) <= new Date();
            if (!dateOfBirthBeforeNow) {
              return { 'dateOfBirthExceedsVaidation': true };
            }
          } else {
            return { 'dateValidation': true };
          }
        }
      }
      return undefined;
    };
  }

  /**
   * 'minLength' validator
   *
   * Requires a control's text value to be greater than a specified length.
   *
   * @param {number} minimumLength - minimum allowed string length
   * @param {boolean = false} invert - instead return error object only if valid
   * @return {IValidatorFn}
   */
  static minLength(minimumLength: number): IValidatorFn {
    if (!hasValue(minimumLength)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentLength = isString(control.value) ? control.value.trim().length : 0;
      let isValid = currentLength >= minimumLength;
      return xor(isValid, invert) ?
        null : { 'minLength': { minimumLength, currentLength } };
    };
  };

  /**
   * 'maxLength' validator
   *
   * Requires a control's text value to be less than a specified length.
   *
   * @param {number} maximumLength - maximum allowed string length
   * @param {boolean = false} invert - instead return error object only if valid
   * @return {IValidatorFn}
   */
  static maxLength(maximumLength: number): IValidatorFn {
    if (!hasValue(maximumLength)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      let currentLength = isString(control.value) ? control.value.trim().length : 0;
      let isValid = currentLength <= maximumLength;
      return xor(isValid, invert) ?
        null : { 'maxLength': { maximumLength, currentLength } };
    };
  };

  /**
   * 'pattern' validator
   *
   * Note: NOT the same as Angular's default pattern validator.
   *
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
  static pattern(pattern: string | RegExp, wholeString = false): IValidatorFn {
    if (!hasValue(pattern)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let regex: RegExp;
      let requiredPattern: string;
      if (typeof pattern === 'string') {
        requiredPattern = (wholeString) ? `^${pattern}$` : pattern;
        regex = new RegExp(requiredPattern);
      } else {
        requiredPattern = pattern.toString();
        regex = pattern;
      }
      let currentValue: string = control.value;
      let isValid = isString(currentValue) ? regex.test(currentValue) : false;
      return xor(isValid, invert) ?
        null : { 'pattern': { requiredPattern, currentValue } };
    };
  }

  /**
   * 'format' validator
   *
   * Requires a control to have a value of a certain format.
   *
   * This validator currently checks the following formsts:
   *   date, time, date-time, email, hostname, ipv4, ipv6,
   *   uri, uri-reference, uri-template, url, uuid, color,
   *   json-pointer, relative-json-pointer, regex
   *
   * Fast format regular expressions copied from AJV:
   * https://github.com/epoberezkin/ajv/blob/master/lib/compile/formats.js
   *
   * @param {JsonSchemaFormatNames} requiredFormat - format to check
   * @return {IValidatorFn}
   */
  static format(requiredFormat: JsonSchemaFormatNames): IValidatorFn {
    if (!hasValue(requiredFormat)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let isValid: boolean;
      let currentValue: string | Date = control.value;
      if (isString(currentValue)) {
        const formatTest: Function | RegExp = jsonSchemaFormatTests[requiredFormat];
        if (typeof formatTest === 'object') {
          isValid = (<RegExp>formatTest).test(<string>currentValue);
        } else if (typeof formatTest === 'function') {
          isValid = (<Function>formatTest)(<string>currentValue);
        } else {
          console.error(`format validator error: "${requiredFormat}" is not a recognized format.`);
          isValid = true;
        }
      } else {
        // Allow JavaScript Date objects
        isValid = ['date', 'time', 'date-time'].includes(requiredFormat) &&
          Object.prototype.toString.call(currentValue) === '[object Date]';
      }
      return xor(isValid, invert) ?
        null : { 'format': { requiredFormat, currentValue } };
    };
  }

  /**
   * 'minimum' validator
   *
   * Requires a control's numeric value to be greater than or equal to
   * a minimum amount.
   *
   * Any non-numeric value is also valid (according to the HTML forms spec,
   * a non-numeric value doesn't have a minimum).
   * https://www.w3.org/TR/html5/forms.html#attr-input-max
   *
   * @param {number} minimum - minimum allowed value
   * @return {IValidatorFn}
   */
  static minimum(minimumValue: number): IValidatorFn {
    if (!hasValue(minimumValue)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentValue = control.value;
      let isValid = !isNumber(currentValue) || currentValue >= minimumValue;
      return xor(isValid, invert) ?
        null : { 'minimum': { minimumValue, currentValue } };
    };
  }

  /**
   * 'exclusiveMinimum' validator
   *
   * Requires a control's numeric value to be less than a maximum amount.
   *
   * Any non-numeric value is also valid (according to the HTML forms spec,
   * a non-numeric value doesn't have a maximum).
   * https://www.w3.org/TR/html5/forms.html#attr-input-max
   *
   * @param {number} exclusiveMinimumValue - maximum allowed value
   * @return {IValidatorFn}
   */
  static exclusiveMinimum(exclusiveMinimumValue: number): IValidatorFn {
    if (!hasValue(exclusiveMinimumValue)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentValue = control.value;
      let isValid = !isNumber(currentValue) || +currentValue < exclusiveMinimumValue;
      return xor(isValid, invert) ?
        null : { 'exclusiveMinimum': { exclusiveMinimumValue, currentValue } };
    };
  }

  /**
   * 'maximum' validator
   *
   * Requires a control's numeric value to be less than or equal to
   * a maximum amount.
   *
   * Any non-numeric value is also valid (according to the HTML forms spec,
   * a non-numeric value doesn't have a maximum).
   * https://www.w3.org/TR/html5/forms.html#attr-input-max
   *
   * @param {number} maximumValue - maximum allowed value
   * @return {IValidatorFn}
   */
  static maximum(maximumValue: number): IValidatorFn {
    if (!hasValue(maximumValue)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentValue = control.value;
      let isValid = !isNumber(currentValue) || +currentValue <= maximumValue;
      return xor(isValid, invert) ?
        null : { 'maximum': { maximumValue, currentValue } };
    };
  }

  /**
   * 'exclusiveMaximum' validator
   *
   * Requires a control's numeric value to be less than a maximum amount.
   *
   * Any non-numeric value is also valid (according to the HTML forms spec,
   * a non-numeric value doesn't have a maximum).
   * https://www.w3.org/TR/html5/forms.html#attr-input-max
   *
   * @param {number} exclusiveMaximumValue - maximum allowed value
   * @return {IValidatorFn}
   */
  static exclusiveMaximum(exclusiveMaximumValue: number): IValidatorFn {
    if (!hasValue(exclusiveMaximumValue)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentValue = control.value;
      let isValid = !isNumber(currentValue) || +currentValue < exclusiveMaximumValue;
      return xor(isValid, invert) ?
        null : { 'exclusiveMaximum': { exclusiveMaximumValue, currentValue } };
    };
  }

  /**
   * 'multipleOf' validator
   *
   * Requires a control to have a numeric value that is a multiple
   * of a specified number.
   *
   * @param {number} multipleOfValue - number value must be a multiple of
   * @return {IValidatorFn}
   */
  static multipleOf(multipleOfValue: number): IValidatorFn {
    if (!hasValue(multipleOfValue)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentValue = control.value;
      let isValid = isNumber(currentValue) &&
        currentValue % multipleOfValue === 0;
      return xor(isValid, invert) ?
        null : { 'multipleOf': { multipleOfValue, currentValue } };
    };
  }

  /**
   * 'minProperties' validator
   *
   * Requires a form group to have a minimum number of properties (i.e. have
   * values entered in a minimum number of controls within the group).
   *
   * @param {number} minimumProperties - minimum number of properties allowed
   * @return {IValidatorFn}
   */
  static minProperties(minimumProperties: number): IValidatorFn {
    if (!hasValue(minimumProperties)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentProperties = Object.keys(control.value).length || 0;
      let isValid = currentProperties >= minimumProperties;
      return xor(isValid, invert) ?
        null : { 'minProperties': { minimumProperties, currentProperties } };
    };
  }

  /**
   * 'maxProperties' validator
   *
   * Requires a form group to have a maximum number of properties (i.e. have
   * values entered in a maximum number of controls within the group).
   *
   * Note: Has no effect if the form group does not contain more than the
   * maximum number of controls.
   *
   * @param {number} maximumProperties - maximum number of properties allowed
   * @return {IValidatorFn}
   */
  static maxProperties(maximumProperties: number): IValidatorFn {
    if (!hasValue(maximumProperties)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      let currentProperties = Object.keys(control.value).length || 0;
      let isValid = currentProperties <= maximumProperties;
      return xor(isValid, invert) ?
        null : { 'maxProperties': { maximumProperties, currentProperties } };
    };
  }

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
  static dependencies(dependencies: any): IValidatorFn {
    if (getType(dependencies) !== 'object' || isEmpty(dependencies)) {
      return JsonValidators.nullValidator;
    }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let allErrors = _mergeObjects(
        forEachCopy(dependencies, (value, requiringField) => {
          if (!hasValue(control.value[requiringField])) { return null; }
          let requiringFieldErrors: ValidationErrors = {};
          let requiredFields: string[];
          let properties: ValidationErrors = {};
          if (getType(dependencies[requiringField]) === 'array') {
            requiredFields = dependencies[requiringField];
          } else if (getType(dependencies[requiringField]) === 'object') {
            requiredFields = dependencies[requiringField]['required'] || [];
            properties = dependencies[requiringField]['properties'] || {};
          }

          // Validate property dependencies
          for (let requiredField of requiredFields) {
            if (xor(!hasValue(control.value[requiredField]), invert)) {
              requiringFieldErrors[requiredField] = { 'required': true };
            }
          }

          // Validate schema dependencies
          requiringFieldErrors = _mergeObjects(requiringFieldErrors,
            forEachCopy(properties, (requirements, requiredField) => {
              let requiredFieldErrors = _mergeObjects(
                forEachCopy(requirements, (requirement, parameter) => {
                  let validator: IValidatorFn = null;
                  if (requirement === 'maximum' || requirement === 'minimum') {
                    let exclusive = !!requirements['exclusiveM' + requirement.slice(1)];
                    validator = JsonValidators[requirement](parameter, exclusive);
                  } else if (typeof JsonValidators[requirement] === 'function') {
                    validator = JsonValidators[requirement](parameter);
                  }
                  return !isDefined(validator) ?
                    null : validator(control.value[requiredField]);
                })
              );
              return isEmpty(requiredFieldErrors) ?
                null : { [requiredField]: requiredFieldErrors };
            })
          );
          return isEmpty(requiringFieldErrors) ?
            null : { [requiringField]: requiringFieldErrors };
        })
      );
      return isEmpty(allErrors) ? null : allErrors;
    };
  }

  /**
   * 'minItems' validator
   *
   * Requires a form array to have a minimum number of values.
   *
   * @param {number} minimumItems - minimum number of items allowed
   * @return {IValidatorFn}
   */
  static minItems(minimumItems: number): IValidatorFn {
    if (!hasValue(minimumItems)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let currentItems = isArray(control.value) ? control.value.length : 0;
      let isValid = currentItems >= minimumItems;
      return xor(isValid, invert) ?
        null : { 'minItems': { minimumItems, currentItems } };
    };
  }

  /**
   * 'maxItems' validator
   *
   * Requires a form array to have a maximum number of values.
   *
   * @param {number} maximumItems - maximum number of items allowed
   * @return {IValidatorFn}
   */
  static maxItems(maximumItems: number): IValidatorFn {
    if (!hasValue(maximumItems)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      let currentItems = isArray(control.value) ? control.value.length : 0;
      let isValid = currentItems <= maximumItems;
      return xor(isValid, invert) ?
        null : { 'maxItems': { maximumItems, currentItems } };
    };
  }

  /**
   * 'uniqueItems' validator
   *
   * Requires values in a form array to be unique.
   *
   * @param {boolean = true} unique? - true to validate, false to disable
   * @return {IValidatorFn}
   */
  static uniqueItems(unique = true): IValidatorFn {
    if (!unique) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let sorted: any[] = control.value.slice().sort();
      let duplicateItems = [];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i - 1] === sorted[i] && duplicateItems.includes(sorted[i])) {
          duplicateItems.push(sorted[i]);
        }
      }
      let isValid = !duplicateItems.length;
      return xor(isValid, invert) ?
        null : { 'uniqueItems': { duplicateItems } };
    };
  }

  /**
   * 'contains' validator
   *
   * TODO: Complete this validator
   *
   * Requires values in a form array to be unique.
   *
   * @param {boolean = true} unique? - true to validate, false to disable
   * @return {IValidatorFn}
   */
  static contains(requiredItem = true): IValidatorFn {
    if (!requiredItem) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value) || !isArray(control.value)) { return null; }
      const currentItems = control.value;
      // const isValid = currentItems.some(item =>
      //
      // );
      const isValid = true;
      return xor(isValid, invert) ?
        null : { 'contains': { requiredItem, currentItems } };
    };
  }

  /**
   * No-op validator. Included for backward compatibility.
   */
  static nullValidator(control: AbstractControl): ValidationErrors | null {
    return null;
  }

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
  static composeAnyOf(validators: IValidatorFn[]): IValidatorFn {
    if (!validators) { return null; }
    let presentValidators = validators.filter(isDefined);
    if (presentValidators.length === 0) { return null; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      let arrayOfErrors =
        _executeValidators(control, presentValidators, invert).filter(isDefined);
      let isValid = validators.length > arrayOfErrors.length;
      return xor(isValid, invert) ?
        null : _mergeObjects(...arrayOfErrors, { 'anyOf': !invert });
    };
  }

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
  static composeOneOf(validators: IValidatorFn[]): IValidatorFn {
    if (!validators) { return null; }
    let presentValidators = validators.filter(isDefined);
    if (presentValidators.length === 0) { return null; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      let arrayOfErrors =
        _executeValidators(control, presentValidators);
      let validControls =
        validators.length - arrayOfErrors.filter(isDefined).length;
      let isValid = validControls === 1;
      if (xor(isValid, invert)) { return null; }
      let arrayOfValids =
        _executeValidators(control, presentValidators, invert);
      return _mergeObjects(...arrayOfErrors, ...arrayOfValids, { 'oneOf': !invert });
    };
  }

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
  static composeAllOf(validators: IValidatorFn[]): IValidatorFn {
    if (!validators) { return null; }
    let presentValidators = validators.filter(isDefined);
    if (presentValidators.length === 0) { return null; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      let combinedErrors = _mergeErrors(
        _executeValidators(control, presentValidators, invert)
      );
      let isValid = combinedErrors === null;
      return (xor(isValid, invert)) ?
        null : _mergeObjects(combinedErrors, { 'allOf': !invert });
    };
  }

  /**
   * 'composeNot' validator inversion function
   *
   * Accepts a single validator function and inverts its result.
   * Returns valid if the submitted validator is invalid, and
   * returns invalid if the submitted validator is valid.
   * (Note: this function can itself be inverted
   *   - e.g. composeNot(composeNot(validator)) -
   *   but this can be confusing and is therefore not recommended.)
   *
   * @param {IValidatorFn[]} validators - validator(s) to invert
   * @return {IValidatorFn} - new validator function that returns opposite result
   */
  static composeNot(validator: IValidatorFn): IValidatorFn {
    if (!validator) { return null; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      if (isEmpty(control.value)) { return null; }
      let error = validator(control, !invert);
      let isValid = error === null;
      return (xor(isValid, invert)) ?
        null : _mergeObjects(error, { 'not': !invert });
    };
  }

  /**
   * 'compose' validator combination function
   *
   * @param {IValidatorFn[]} validators - array of validators to combine
   * @return {IValidatorFn} - single combined validator function
   */
  static compose(validators: IValidatorFn[]): IValidatorFn {
    if (!validators) { return null; }
    let presentValidators = validators.filter(isDefined);
    if (presentValidators.length === 0) { return null; }
    return (control: AbstractControl, invert = false): ValidationErrors | null =>
      _mergeErrors(_executeValidators(control, presentValidators, invert));
  };

  /**
   * 'composeAsync' async validator combination function
   *
   * @param {AsyncIValidatorFn[]} async validators - array of async validators
   * @return {AsyncIValidatorFn} - single combined async validator function
   */
  static composeAsync(validators: AsyncIValidatorFn[]): AsyncIValidatorFn {
    if (!validators) { return null; }
    let presentValidators = validators.filter(isDefined);
    if (presentValidators.length === 0) { return null; }
    return (control: AbstractControl) => {
      const observables =
        _executeAsyncValidators(control, presentValidators).map(toObservable);
      return map.call(forkJoin(observables), _mergeErrors);
    }
  }

  // Additional angular validators (not used by Angualr JSON Schema Form)
  // From https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts

  /**
   * Validator that requires controls to have a value greater than a number.
   */
  static min(min: number): ValidatorFn {
    if (!hasValue(min)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl): ValidationErrors | null => {
      // don't validate empty values to allow optional controls
      if (isEmpty(control.value) || isEmpty(min)) { return null; }
      const value = parseFloat(control.value);
      const actual = control.value;
      // Controls with NaN values after parsing should be treated as not having a
      // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
      return isNaN(value) || value >= min ? null : { 'min': { min, actual } };
    };
  }

  /**
   * Validator that requires controls to have a value less than a number.
   */
  static max(max: number): ValidatorFn {
    if (!hasValue(max)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl): ValidationErrors | null => {
      // don't validate empty values to allow optional controls
      if (isEmpty(control.value) || isEmpty(max)) { return null; }
      const value = parseFloat(control.value);
      const actual = control.value;
      // Controls with NaN values after parsing should be treated as not having a
      // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
      return isNaN(value) || value <= max ? null : { 'max': { max, actual } };
    };
  }

  /**
   * Validator that requires control value to be true.
   */
  static requiredTrue(control: AbstractControl): ValidationErrors | null {
    if (!control) { return JsonValidators.nullValidator; }
    return control.value === true ? null : { 'required': true };
  }

  /**
   * Validator that performs email validation.
   */
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control) { return JsonValidators.nullValidator; }
    const EMAIL_REGEXP =
      /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
    return EMAIL_REGEXP.test(control.value) ? null : { 'email': true };
  }

  /**
   * PO BOX Validation for Address line
   * @static
   * @param {*} poBoxCriteria
   * @returns {IValidatorFn}
   * @memberof JsonValidators
   */
  static poBoxValidation(poBoxCriteria: any): IValidatorFn {
    if (!hasValue(poBoxCriteria)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      const controlOptions = poBoxCriteria;
      if (!control.value) {
        return undefined;
      }
      let controlValue = control.value.toLowerCase();
      if (controlOptions && controlOptions.allowedStates && controlOptions.allowedText) {
        let selectedState;
        if (control.parent && controlOptions.controlToCheck) {
          selectedState = control.parent.value && control.parent.value[controlOptions.controlToCheck];
        }
        const isValidPOBox = controlOptions.allowedText.some((value) => {
          if (controlOptions.exactMatch) {
            return controlValue === value.toLowerCase();
          } else {
            return controlValue.includes(value.toLowerCase());
          }
        });
        // Exact match both allow text and allow states should satisfy exactly
        if (controlOptions.exactMatch) {
          if (selectedState && (controlOptions.allowedStates.includes(selectedState) && !isValidPOBox)) {
            return { 'poBoxValidation': true };
          }
        } else {
          if (selectedState && (!controlOptions.allowedStates.includes(selectedState) && isValidPOBox)) {
            return { 'poBoxValidation': true };
          }
        }
      }
      return undefined;
    };
  }

  /**
   * Postal Code Validation
   * @static
   * @returns {IValidatorFn}
   * @memberof JsonValidators
   */
  static postalCodeValidation(postalCodeCriteria: any): IValidatorFn {
    if (!hasValue(postalCodeCriteria)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      const controlOptions = postalCodeCriteria;
      if (!control.value) {
        return undefined;
      }
      let controlValue = control.value.toUpperCase();
      if (controlOptions && controlOptions.allowedPatterns) {
        let selectedCountry;
        if (control.parent && controlOptions.controlToCheck) {
          selectedCountry = control.parent.value && control.parent.value[controlOptions.controlToCheck];
        }
        const allowedPattern = selectedCountry ? controlOptions.allowedPatterns.find(item =>
          item.countryID === Number(selectedCountry)) : null;
        let isValidPostalCode;
        if (selectedCountry && allowedPattern && allowedPattern.format) {
          isValidPostalCode = controlValue.startsWith(allowedPattern.format)
        } else if (selectedCountry && !allowedPattern) {
          isValidPostalCode = !controlOptions.allowedPatterns.find(item => controlValue.startsWith(item.format))
        }
        if (selectedCountry && !isValidPostalCode) {
          return { 'postalCodeValidation': true };
        }
      }
      return undefined;
    };
  }

  /**
   * Postal Code Validation
   * @static
   * @returns {IValidatorFn}
   * @memberof JsonValidators
   */
  static prefixPostalCodeRestriction(postalCodeCriteria: any): IValidatorFn {
    if (!hasValue(postalCodeCriteria)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      const controlOptions = postalCodeCriteria;
      if (!control.value) {
        return undefined;
      }
      let controlValue = control.value.toUpperCase();
      if (controlOptions && controlOptions.restrictedPrefix) {
        const allowedPatterns = controlOptions.restrictedPrefix.split(',');
        let restrictedPostalCode;
        if (allowedPatterns && allowedPatterns.length > 0) {
          allowedPatterns.filter(x => {
            if (controlValue.startsWith(x)) {
              restrictedPostalCode = true;
            }
          });
        }
        if (restrictedPostalCode) {
          return { 'prefixPostalCodeRestriction': true };
        }
      }
      return undefined;
    };
  }

  /**
   * @description Validate value from options
   * @author njagadeesan
   * @date 2020-04-24
   * @static
   * @param {*} poBoxCriteria
   * @returns {IValidatorFn}
   * @memberof JsonValidators
   */
  static optionsMatchValidation(poBoxCriteria: any): IValidatorFn {
    if (!hasValue(poBoxCriteria)) { return JsonValidators.nullValidator; }
    return (control: AbstractControl, invert = false): ValidationErrors | null => {
      const controlOptions = poBoxCriteria;
      if (!control.value) {
        return undefined;
      }
      let controlValue = control.value.toLowerCase();
      if (controlOptions && controlOptions.options) {
        const isValidData = controlOptions.options.some((value) => {
          if (controlOptions.exactMatch) {
            return controlValue === value.toLowerCase();
          } else {
            return controlValue.includes(value.toLowerCase());
          }
        });
        if (controlOptions.negate && isValidData) {
          return { 'optionsMatchValidation': true };
        } else if (!controlOptions.negate && !isValidData) {
          return { 'optionsMatchValidation': true };
        }
      }
      return undefined;
    };
  }
}
