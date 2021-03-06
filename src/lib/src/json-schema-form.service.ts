import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

import * as Ajv from 'ajv';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';

import {
  hasValue, isArray, isDefined, isEmpty, isObject, isString
} from './shared/validator.functions';
import {
  fixTitle, forEach, hasOwn, toTitleCase
} from './shared/utility.functions';
import { JsonPointer } from './shared/jsonpointer.functions';
import {
  buildSchemaFromData, buildSchemaFromLayout, removeRecursiveReferences,
  resolveSchemaReferences
} from './shared/json-schema.functions';
import {
  buildFormGroup, buildFormGroupTemplate, formatFormData, getControl
} from './shared/form-group.functions';
import { buildLayout, getLayoutNode } from './shared/layout.functions';
import { Observable } from 'rxjs';
import moment from 'moment';

export interface TitleMapItem {
  name?: string, value?: any, checked?: boolean, group?: string, items?: TitleMapItem[]
};
export interface ErrorMessages {
  [control_name: string]: { message: string | Function | Object, code: string }[]
};

@Injectable()
export class JsonSchemaFormService {
  JsonFormCompatibility = false;
  ReactJsonSchemaFormCompatibility = false;
  AngularSchemaFormCompatibility = false;
  tpldata: any = {};

  customKeywords = { dobFormat: false, poBoxValidation: false, optionsMatchValidation:false, postalCodeValidation: false, prefixPostalCodeRestriction: false };
  ajvOptions: any = { allErrors: true, jsonPointers: true };
  ajv: any = new Ajv(this.ajvOptions); // AJV: Another JSON Schema Validator
  validateFormData: any = null; // Compiled AJV function to validate active form's schema

  formValues: any = {}; // Internal form data (may not have correct types)
  data: any = {}; // Output form data (formValues, formatted with correct data types)
  schema: any = {}; // Internal JSON Schema
  layout: any[] = []; // Internal form layout
  formGroupTemplate: any = {}; // Template used to create formGroup
  formGroup: any = null; // Angular formGroup, which powers the reactive form
  framework: any = null; // Active framework component
  formOptions: any; // Active options, used to configure the form

  validData: any = null; // Valid form data (or null) (=== isValid ? data : null)
  isValid: boolean = null; // Is current form data valid?
  ajvErrors: any = null; // Ajv errors for current data
  validationErrors: any = null; // Any validation errors for current data
  dataErrors: any = new Map(); //
  formValueSubscription: any = null; // Subscription to formGroup.valueChanges observable (for un- and re-subscribing)
  dataChanges: Subject<any> = new Subject(); // Form data observable
  isValidChanges: Subject<any> = new Subject(); // isValid observable
  validationErrorChanges: Subject<any> = new Subject(); // validationErrors observable

  arrayMap: Map<string, number> = new Map(); // Maps arrays in data object and number of tuple values
  dataMap: Map<string, any> = new Map(); // Maps paths in form data to schema and formGroup paths
  dataRecursiveRefMap: Map<string, string> = new Map(); // Maps recursive reference points in form data
  schemaRecursiveRefMap: Map<string, string> = new Map(); // Maps recursive reference points in schema
  schemaRefLibrary: any = {}; // Library of schemas for resolving schema $refs
  layoutRefLibrary: any = { '': null }; // Library of layout nodes for adding to form
  templateRefLibrary: any = {}; // Library of formGroup templates for adding to form
  hasRootReference = false; // Does the form include a recursive reference to itself?

  // Default global form options
  defaultFormOptions: any = {
    addSubmit: 'auto', // Add a submit button if layout does not have one?
    // for addSubmit: true = always, false = never,
    // 'auto' = only if layout is undefined (form is built from schema alone)
    debug: false, // Show debugging output?
    disableInvalidSubmit: true, // Disable submit if form invalid?
    formDisabled: false, // Set entire form as disabled? (not editable, and disables outputs)
    formReadonly: false, // Set entire form as read only? (not editable, but outputs still enabled)
    fieldsRequired: false, // (set automatically) Are there any required fields in the form?
    framework: 'no-framework', // The framework to load
    loadExternalAssets: false, // Load external css and JavaScript for framework?
    pristine: { errors: true, success: true },
    supressPropertyTitles: false,
    setSchemaDefaults: 'auto', // Set fefault values from schema?
    // true = always set (unless overridden by layout default or formValues)
    // false = never set
    // 'auto' = set in addable components, and everywhere if formValues not set
    setLayoutDefaults: 'auto', // Set fefault values from layout?
    // true = always set (unless overridden by formValues)
    // false = never set
    // 'auto' = set in addable components, and everywhere if formValues not set
    validateOnRender: 'auto', // Validate fields immediately, before they are touched?
    // true = validate all fields immediately
    // false = only validate fields after they are touched by user
    // 'auto' = validate fields with values immediately, empty fields after they are touched
    widgets: {}, // Any custom widgets to load
    defautWidgetOptions: { // Default options for form control widgets
      listItems: 1, // Number of list items to initially add to arrays with no default value
      addable: true, // Allow adding items to an array or $ref point?
      orderable: true, // Allow reordering items within an array?
      removable: true, // Allow removing items from an array or $ref point?
      enableErrorState: true, // Apply 'has-error' class when field fails validation?
      // disableErrorState: false, // Don't apply 'has-error' class when field fails validation?
      enableSuccessState: true, // Apply 'has-success' class when field validates?
      // disableSuccessState: false, // Don't apply 'has-success' class when field validates?
      feedback: false, // Show inline feedback icons?
      feedbackOnRender: false, // Show errorMessage on Render?
      notitle: false, // Hide title?
      disabled: false, // Set control as disabled? (not editable, and excluded from output)
      readonly: false, // Set control as read only? (not editable, but included in output)
      returnEmptyFields: true, // return values for fields that contain no data?
      validationMessages: { // Default error messages
        required: 'This field is required.',
        minLength: 'Must be {{minimumLength}} characters or longer (current length: {{currentLength}})',
        maxLength: 'Must be {{maximumLength}} characters or shorter (current length: {{currentLength}})',
        pattern: 'Must match pattern: {{requiredPattern}}',
        format: function (error) {
          switch (error.requiredFormat) {
            case 'date':
              return 'Must be a date, like "2000-12-31"';
            case 'time':
              return 'Must be a time, like "16:20" or "03:14:15.9265"';
            case 'date-time':
              return 'Must be a date-time, like "2000-03-14T01:59" or "2000-03-14T01:59:26.535Z"';
            case 'email':
              return 'Must be an email address, like "name@example.com"';
            case 'hostname':
              return 'Must be a hostname, like "example.com"';
            case 'ipv4':
              return 'Must be an IPv4 address, like "127.0.0.1"';
            case 'ipv6':
              return 'Must be an IPv6 address, like "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
              return 'Must be a url, like "http://www.example.com/page.html"';
            case 'uuid':
              return 'Must be a uuid, like "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
              return 'Must be a color, like "#FFFFFF" or "rgb(255, 255, 255)"';
            case 'json-pointer':
              return 'Must be a JSON Pointer, like "/pointer/to/something"';
            case 'relative-json-pointer':
              return 'Must be a relative JSON Pointer, like "2/pointer/to/something"';
            case 'regex':
              return 'Must be a regular expression, like "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
              return 'Must be a correctly formatted ' + error.requiredFormat;
          }
        },
        minimum: 'Must be {{minimumValue}} or more',
        exclusiveMinimum: 'Must be more than {{exclusiveMinimumValue}}',
        maximum: 'Must be {{maximumValue}} or less',
        exclusiveMaximum: 'Must be less than {{exclusiveMaximumValue}}',
        multipleOf: function (error) {
          if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Must have ${decimals} or fewer decimal places.`;
          } else {
            return `Must be a multiple of ${error.multipleOfValue}.`;
          }
        },
        minProperties: 'Must have {{minimumProperties}} or more items (current items: {{currentProperties}})',
        maxProperties: 'Must have {{maximumProperties}} or fewer items (current items: {{currentProperties}})',
        minItems: 'Must have {{minimumItems}} or more items (current items: {{currentItems}})',
        maxItems: 'Must have {{maximumItems}} or fewer items (current items: {{currentItems}})',
        uniqueItems: 'All items must be unique',
        // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
      },
    },
  };
  private subject: Subject<any> = new Subject<any>();

  /**
  * @param  {any} shippingInfo
  */
  setBtnClick(shippingInfo: any) {
    this.subject.next(shippingInfo);
  }

  /**
   */
  getBtnClick(): Observable<any> {
    return this.subject.asObservable();
  }
  getData() { return this.data; }

  getSchema() { return this.schema; }

  getLayout() { return this.layout; }

  resetAllValues() {
    this.JsonFormCompatibility = false;
    this.ReactJsonSchemaFormCompatibility = false;
    this.AngularSchemaFormCompatibility = false;
    this.tpldata = {};
    this.validateFormData = null;
    this.formValues = {};
    this.schema = {};
    this.layout = [];
    this.formGroupTemplate = {};
    this.formGroup = null;
    this.framework = null;
    this.data = {};
    this.validData = null;
    this.isValid = null;
    this.validationErrors = null;
    this.arrayMap = new Map();
    this.dataMap = new Map();
    this.dataRecursiveRefMap = new Map();
    this.schemaRecursiveRefMap = new Map();
    this.layoutRefLibrary = {};
    this.schemaRefLibrary = {};
    this.templateRefLibrary = {};
    this.formOptions = cloneDeep(this.defaultFormOptions);
  }

  /**
   * 'buildRemoteError' function
   *
   * Example errors:
   * {
   *   last_name: [ {
   *     message: 'Last name must by start with capital letter.',
   *     code: 'capital_letter'
   *   } ],
   *   email: [ {
   *     message: 'Email must be from example.com domain.',
   *     code: 'special_domain'
   *   }, {
   *     message: 'Email must contain an @ symbol.',
   *     code: 'at_symbol'
   *   } ]
   * }
   * @param {ErrorMessages} errors
   */
  buildRemoteError(errors: ErrorMessages) {
    forEach(errors, (value, key) => {
      if (key in this.formGroup.controls) {
        for (const error of value) {
          const err = {};
          err[error['code']] = error['message'];
          this.formGroup.get(key).setErrors(err, { emitEvent: true });
        }
      }
    });
  }

  validateData(newValue: any, updateSubscriptions = true): void {
    if (newValue && newValue.dateOfBirth) {
      let value = newValue.dateOfBirth;
      if (value && value._i && (typeof value._i === 'object')) {
        value = moment(value._d).format('DD-MMM-YYYY');
      } else if (value && value._i && (typeof value._i === 'string')) {
        value = value._i;
      }
      newValue.dateOfBirth = value;
    }
    // Format raw form data to correct data types
    this.data = formatFormData(
      newValue, this.dataMap, this.dataRecursiveRefMap,
      this.arrayMap, this.formOptions.returnEmptyFields
    );
    const data = this.trimObjectValues({...this.data});
    this.isValid = this.validateFormData(data);
    this.validData = this.isValid ? this.data : null;
    const compileErrors = errors => {
      const compiledErrors = {};
      (errors || []).forEach(error => {
        if (!compiledErrors[error.dataPath]) { compiledErrors[error.dataPath] = []; }
        compiledErrors[error.dataPath].push(error.message);
      });
      return compiledErrors;
    };
    this.ajvErrors = this.validateFormData.errors;
    this.validationErrors = compileErrors(this.validateFormData.errors);
    if (updateSubscriptions) {
      this.dataChanges.next(this.data);
      this.isValidChanges.next(this.isValid);
      this.validationErrorChanges.next(this.ajvErrors);
    }
  }

  trimObjectValues(obj: any): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        if (typeof (value) === 'string') {
          value = value && value.trim();
        }
        obj[key] = value;
      }
    }
    return obj;
  }

  buildFormGroupTemplate(formValues: any = null, setValues = true) {
    this.formGroupTemplate = buildFormGroupTemplate(this, formValues, setValues);
  }

  buildFormGroup() {
    this.formGroup = <FormGroup>buildFormGroup(this.formGroupTemplate);
    if (this.formGroup) {
      this.compileAjvSchema();
      this.validateData(this.formGroup.value);

      // Set up observables to emit data and validation info when form data changes
      if (this.formValueSubscription) { this.formValueSubscription.unsubscribe(); }
      this.formValueSubscription = this.formGroup.valueChanges
        .subscribe(formValue => this.validateData(formValue));
    }
  }

  buildLayout(widgetLibrary: any) {
    this.layout = buildLayout(this, widgetLibrary);
  }

  setOptions(newOptions: any) {
    if (isObject(newOptions)) {
      const addOptions = cloneDeep(newOptions);
      // Backward compatibility for 'defaultOptions' (renamed 'defautWidgetOptions')
      if (isObject(addOptions.defaultOptions)) {
        Object.assign(this.formOptions.defautWidgetOptions, addOptions.defaultOptions);
        delete addOptions.defaultOptions;
      }
      if (isObject(addOptions.defautWidgetOptions)) {
        Object.assign(this.formOptions.defautWidgetOptions, addOptions.defautWidgetOptions);
        delete addOptions.defautWidgetOptions;
      }
      Object.assign(this.formOptions, addOptions);

      // convert disableErrorState / disableSuccessState to enable...
      const globalDefaults = this.formOptions.defautWidgetOptions;
      ['ErrorState', 'SuccessState']
        .filter(suffix => hasOwn(globalDefaults, 'disable' + suffix))
        .forEach(suffix => {
          globalDefaults['enable' + suffix] = !globalDefaults['disable' + suffix];
          delete globalDefaults['disable' + suffix];
        });
    }
  }

  compileAjvSchema() {
    if (!this.validateFormData) {

      // if 'ui:order' exists in properties, move it to root before compiling with ajv
      if (Array.isArray(this.schema.properties['ui:order'])) {
        this.schema['ui:order'] = this.schema.properties['ui:order'];
        delete this.schema.properties['ui:order'];
      }
      if (!this.customKeywords.dobFormat) {
        this.ajv.addKeyword('dobFormat', {
          compile: function (sch, parentSchema) {
            // tslint:disable-next-line:max-line-length
            const datepattern = /^(?:(?:31(|-|)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec|jan|mar|may|jul|aug|oct|dec|JAN|MAR|MAY|JUL|AUG|OCT|DEC)))\1|(?:(?:29|30)(|-|)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|jan|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|JAN|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))\2))(?:(?:1[6-9]|[2-9]\d)?\d{4})$|^(?:29(|-|)(?:0?2|(?:Feb|feb|FEB))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(|-|)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|jan|feb|mar|apr|may|jun|jul|aug|sep|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP))|(?:1[0-2]|(?:Oct|Nov|Dec|oct|nov|dec|OCT|NOV|DEC)))\4(?:(?:1[6-9]|[2-9]\d)?\d{4})$/;
            return function (data) {
              if (data && data.length === 10 && data.split('-')[0] && data.split('-')[0].length === 4) {
                data = moment(data, 'YYYY-MM-DD').format('DD-MMM-YYYY');
              }
              if (new RegExp(datepattern).test(data)) {
                const characterCheck = /[a-zA-z]/;
                let dateParts = data.split('-');
                if (characterCheck.test(dateParts[1])) {
                  data = moment(data, 'DD-MMM-YYYY').format('DD-MM-YYYY');
                }
                dateParts = data.split('-');
                const eighteenYearsBeforeNow = new Date(+dateParts[2] + 18, +dateParts[1] - 1, +dateParts[0]) <= new Date();
                if (!eighteenYearsBeforeNow && sch != 'noEighteenYearsValidation') {
                  return false;
                }
                const dateOfBirthBeforeNow = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]) <= new Date();
                if (!dateOfBirthBeforeNow) {
                  return false;
                }
                return true;
              } else {
                return false;
              }
            }
          },
          errors: false,
        });
      }
      if (!this.customKeywords.poBoxValidation) {
        const jsf = this;
        this.ajv.addKeyword('poBoxValidation', {
          compile: function (sch, parentSchema) {
            return function (data) {
              const controlOptions = sch;
              if (!data) {
                return true;
              }
              let controlValue = data.toLowerCase();
              if (controlOptions && controlOptions.allowedStates && controlOptions.allowedText) {
                let selectedState;
                if (jsf && jsf.formGroup && controlOptions.controlToCheck) {
                  selectedState = jsf.formGroup.value && jsf.formGroup.value[controlOptions.controlToCheck];
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
                    return false;
                  }
                } else {
                  if (selectedState && (!controlOptions.allowedStates.includes(selectedState) && isValidPOBox)) {
                    return false;
                  }
                }
              }
              return true;
            }
          },
          errors: false,
        });
        this.customKeywords.poBoxValidation = true;
      }
      if (!this.customKeywords.optionsMatchValidation) {
        this.addOptionsMatchValidation();
      }
      if (!this.customKeywords.postalCodeValidation) {
        this.addPostalCodeValidation();
      }
      if (!this.customKeywords.prefixPostalCodeRestriction) {
        this.prefixPostalCodeRestriction();
      }
      this.customKeywords.dobFormat = true;
      this.ajv.removeSchema(this.schema);
      this.validateFormData = this.ajv.compile(this.schema);
    }
  }

  buildSchemaFromData(data?: any, requireAllFields = false): any {
    if (data) { return buildSchemaFromData(data, requireAllFields); }
    this.schema = buildSchemaFromData(this.formValues, requireAllFields);
  }

  buildSchemaFromLayout(layout?: any): any {
    if (layout) { return buildSchemaFromLayout(layout); }
    this.schema = buildSchemaFromLayout(this.layout);
  }


  setTpldata(newTpldata: any = {}): void {
    this.tpldata = newTpldata;
  }

  parseText(
    text = '', value: any = {}, values: any = {}, key: number | string = null
  ): string {
    if (!text || !/{{.+?}}/.test(text)) { return text; }
    return text.replace(/{{(.+?)}}/g, (...a) =>
      this.parseExpression(a[1], value, values, key, this.tpldata)
    );
  }

  parseExpression(
    expression = '', value: any = {}, values: any = {},
    key: number | string = null, tpldata: any = null
  ) {
    if (typeof expression !== 'string') { return ''; }
    const index = typeof key === 'number' ? (key + 1) + '' : (key || '');
    expression = expression.trim();
    if ((expression[0] === "'" || expression[0] === '"') &&
      expression[0] === expression[expression.length - 1] &&
      expression.slice(1, expression.length - 1).indexOf(expression[0]) === -1
    ) {
      return expression.slice(1, expression.length - 1);
    }
    if (expression === 'idx' || expression === '$index') { return index; }
    if (expression === 'value' && !hasOwn(values, 'value')) { return value; }
    if (['"', "'", ' ', '||', '&&', '+'].every(delim => expression.indexOf(delim) === -1)) {
      const pointer = JsonPointer.parseObjectPath(expression);
      return pointer[0] === 'value' && JsonPointer.has(value, pointer.slice(1)) ?
        JsonPointer.get(value, pointer.slice(1)) :
        pointer[0] === 'values' && JsonPointer.has(values, pointer.slice(1)) ?
          JsonPointer.get(values, pointer.slice(1)) :
          pointer[0] === 'tpldata' && JsonPointer.has(tpldata, pointer.slice(1)) ?
            JsonPointer.get(tpldata, pointer.slice(1)) :
            JsonPointer.has(values, pointer) ? JsonPointer.get(values, pointer) : '';
    }
    if (expression.indexOf('[idx]') > -1) {
      expression = expression.replace(/\[idx\]/g, <string>index);
    }
    if (expression.indexOf('[$index]') > -1) {
      expression = expression.replace(/\[$index\]/g, <string>index);
    }
    // TODO: Improve expression evaluation by parsing quoted strings first
    // let expressionArray = expression.match(/([^"']+|"[^"]+"|'[^']+')/g);
    if (expression.indexOf('||') > -1) {
      return expression.split('||').reduce((all, term) =>
        all || this.parseExpression(term, value, values, key, tpldata), ''
      );
    }
    if (expression.indexOf('&&') > -1) {
      return expression.split('&&').reduce((all, term) =>
        all && this.parseExpression(term, value, values, key, tpldata), ' '
      ).trim();
    }
    if (expression.indexOf('+') > -1) {
      return expression.split('+')
        .map(term => this.parseExpression(term, value, values, key, tpldata))
        .join('');
    }
    return '';
  }

  addOptionsMatchValidation(): void {
    const jsf = this;
    this.ajv.addKeyword('optionsMatchValidation', {
      compile: function (sch, parentSchema) {
        return function (data) {
          const controlOptions = sch;
          if (!data) {
            return true;
          }
          let controlValue = data.toLowerCase();
          if (controlOptions && controlOptions.options) {
            const isValidData = controlOptions.options.some((value) => {
              if (controlOptions.exactMatch) {
                return controlValue === value.toLowerCase();
              } else {
                return controlValue.includes(value.toLowerCase());
              }
            });
            if (controlOptions.negate && isValidData) {
              return false;
            } else if (!controlOptions.negate && !isValidData){
              return false;
            }
          }
          return true;
        }
      },
      errors: false,
    });
    this.customKeywords.optionsMatchValidation = true;
  
  }

  /**
   * postal code validation
   */
  addPostalCodeValidation(): void {
    const jsf = this;
        this.ajv.addKeyword('postalCodeValidation', {
          compile: function (sch, parentSchema) {
            return function (data) {
              const controlOptions = sch;
              if (!data) {
                return true;
              }
              let controlValue = data.toUpperCase();
              if (controlOptions && controlOptions.allowedPatterns) {
                let selectedCountry;
                if (jsf && jsf.formGroup && controlOptions.controlToCheck) {
                  selectedCountry = jsf.formGroup.value && jsf.formGroup.value[controlOptions.controlToCheck];
                }
                const allowedPattern = selectedCountry ? controlOptions.allowedPatterns.find(item =>
                   item.countryID === Number(selectedCountry)) : null;
                let isValidPostalCode;
                if (selectedCountry && allowedPattern && allowedPattern.format) {
                  isValidPostalCode =  controlValue.startsWith(allowedPattern.format)
                } else if (selectedCountry && !allowedPattern) {
                  isValidPostalCode = !controlOptions.allowedPatterns.find(item => controlValue.startsWith(item.format))
                }
                if (selectedCountry && !isValidPostalCode) {
                  return false;
                }
              }
              return true;
            }
          },
          errors: false,
        });
        this.customKeywords.postalCodeValidation = true;
  }

  /**
   * prefix Postal Code Restriction
   */
  prefixPostalCodeRestriction(): void {
    const jsf = this;
        this.ajv.addKeyword('prefixPostalCodeRestriction', {
          compile: function (sch, parentSchema) {
            return function (data) {
              const controlOptions = sch;
              if (!data) {
                return true;
              }
              let controlValue = data.toUpperCase();
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
                return !restrictedPostalCode;
              }
              return true;
            }
          },
          errors: false,
        });
        this.customKeywords.prefixPostalCodeRestriction = true;
  }

  setTitle(
    parentCtx: any = {}, childNode: any = null, index: number = null
  ): string {
    const parentNode = parentCtx.layoutNode;
    const parentValues: any = this.getFormControlValue(parentCtx);
    const isArrayItem =
      (parentNode.type || '').slice(-5) === 'array' && isArray(parentValues);
    const text = JsonPointer.getFirst(
      isArrayItem && childNode.type !== '$ref' ? [
        [childNode, '/options/legend'],
        [childNode, '/options/title'],
        [parentNode, '/options/title'],
        [parentNode, '/options/legend'],
      ] : [
          [childNode, '/options/title'],
          [childNode, '/options/legend'],
          [parentNode, '/options/title'],
          [parentNode, '/options/legend']
        ]
    );
    if (!text) { return text; }
    const childValue = isArray(parentValues) && index < parentValues.length ?
      parentValues[index] : parentValues;
    return this.parseText(text, childValue, parentValues, index);
  }

  initializeControl(ctx: any, bind = true): boolean {
    if (!isObject(ctx)) { return false; }
    if (isEmpty(ctx.options)) {
      ctx.options = !isEmpty((ctx.layoutNode || {}).options) ?
        ctx.layoutNode.options : cloneDeep(this.formOptions);
    }
    ctx.formControl = this.getFormControl(ctx);
    ctx.boundControl = bind && !!ctx.formControl;
    if (ctx.formControl) {
      ctx.controlName = this.getFormControlName(ctx);
      ctx.controlValue = ctx.formControl.value;
      ctx.controlDisabled = ctx.formControl.disabled;
      ctx.options.errorMessage = ctx.formControl.status === 'VALID' ? null :
        this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages);
      ctx.options.showErrors = this.formOptions.validateOnRender === true ||
        (this.formOptions.validateOnRender === 'auto' && hasValue(ctx.controlValue));
      ctx.formControl.statusChanges.subscribe(status =>
        ctx.options.errorMessage = status === 'VALID' ? null :
          this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages)
      );
      ctx.formControl.valueChanges.subscribe(value => {
        if (!isEqual(ctx.controlValue, value)) { ctx.controlValue = value }
      });
    } else {
      ctx.controlName = ctx.layoutNode.name;
      ctx.controlValue = ctx.layoutNode.value || null;
      const dataPointer = this.getDataPointer(ctx);
      if (bind && dataPointer) {
        console.error(`warning: control "${dataPointer}" is not bound to the Angular FormGroup.`);
      }
    }
    return ctx.boundControl;
  }

  formatErrors(errors: any, validationMessages: any = {}): string {
    if (isEmpty(errors)) { return null; }
    if (!isObject(validationMessages)) { validationMessages = {}; }
    const addSpaces = string => string[0].toUpperCase() + (string.slice(1) || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
    const formatError = (error) => typeof error === 'object' ?
      Object.keys(error).map(key =>
        error[key] === true ? addSpaces(key) :
          error[key] === false ? 'Not ' + addSpaces(key) :
            addSpaces(key) + ': ' + formatError(error[key])
      ).join(', ') :
      addSpaces(error.toString());
    const messages = [];
    return Object.keys(errors)
      // Hide 'required' error, unless it is the only one
      .filter(errorKey => errorKey !== 'required' || Object.keys(errors).length === 1)
      .map(errorKey =>
        // If validationMessages is a string, return it
        typeof validationMessages === 'string' ? validationMessages :
          // If custom error message is a function, return function result
          typeof validationMessages[errorKey] === 'function' ?
            validationMessages[errorKey](errors[errorKey]) :
            // If custom error message is a string, replace placeholders and return
            typeof validationMessages[errorKey] === 'string' ?
              // Does error message have any {{property}} placeholders?
              validationMessages[errorKey].indexOf('{{') === -1 ?
                validationMessages[errorKey] :
                // Replace {{property}} placeholders with values
                Object.keys(errors[errorKey])
                  .reduce((errorMessage, errorProperty) => errorMessage.replace(
                    new RegExp('{{' + errorProperty + '}}', 'g'),
                    errors[errorKey][errorProperty]
                  ), validationMessages[errorKey]) :
              // If no custom error message, return formatted error data instead
              addSpaces(errorKey) + ' Error: ' + formatError(errors[errorKey])
      ).join('<br>');
  }

  updateValue(ctx: any, value: any): void {

    // Set value of current control
    ctx.controlValue = value;
    if (ctx.boundControl) {
      ctx.formControl.setValue(value);
      ctx.formControl.markAsDirty();
    }
    ctx.layoutNode.value = value;

    // Set values of any related controls in copyValueTo array
    if (isArray(ctx.options.copyValueTo)) {
      for (const item of ctx.options.copyValueTo) {
        const targetControl = getControl(this.formGroup, item);
        if (isObject(targetControl) && typeof targetControl.setValue === 'function') {
          targetControl.setValue(value);
          targetControl.markAsDirty();
        }
      }
    }
  }

  updateArrayCheckboxList(ctx: any, checkboxList: TitleMapItem[]): void {
    const formArray = <FormArray>this.getFormControl(ctx);

    // Remove all existing items
    while (formArray.value.length) { formArray.removeAt(0); }

    // Re-add an item for each checked box
    const refPointer = removeRecursiveReferences(
      ctx.layoutNode.dataPointer + '/-', this.dataRecursiveRefMap, this.arrayMap
    );
    for (const checkboxItem of checkboxList) {
      if (checkboxItem.checked) {
        const newFormControl = buildFormGroup(this.templateRefLibrary[refPointer]);
        newFormControl.setValue(checkboxItem.value);
        formArray.push(newFormControl);
      }
    }
    formArray.markAsDirty();
  }

  getFormControl(ctx: any): AbstractControl {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
      ctx.layoutNode.type === '$ref'
    ) { return null; }
    return getControl(this.formGroup, this.getDataPointer(ctx));
  }

  getFormControlValue(ctx: any): AbstractControl {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
      ctx.layoutNode.type === '$ref'
    ) { return null; }
    const control = getControl(this.formGroup, this.getDataPointer(ctx));
    return control ? control.value : null;
  }

  getFormControlGroup(ctx: any): FormArray | FormGroup {
    if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer)) { return null; }
    return getControl(this.formGroup, this.getDataPointer(ctx), true);
  }

  getFormControlName(ctx: any): string {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) || !hasValue(ctx.dataIndex)
    ) { return null; }
    return JsonPointer.toKey(this.getDataPointer(ctx));
  }

  getLayoutArray(ctx: any): any[] {
    return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -1);
  }

  getParentNode(ctx: any): any {
    return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -2);
  }

  getDataPointer(ctx: any): string {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) || !hasValue(ctx.dataIndex)
    ) { return null; }
    return JsonPointer.toIndexedPointer(
      ctx.layoutNode.dataPointer, ctx.dataIndex, this.arrayMap
    );
  }

  getLayoutPointer(ctx: any): string {
    if (!hasValue(ctx.layoutIndex)) { return null; }
    return '/' + ctx.layoutIndex.join('/items/');
  }

  isControlBound(ctx: any): boolean {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) || !hasValue(ctx.dataIndex)
    ) { return false; }
    const controlGroup = this.getFormControlGroup(ctx);
    const name = this.getFormControlName(ctx);
    return controlGroup ? hasOwn(controlGroup.controls, name) : false;
  }

  addItem(ctx: any, name?: string): boolean {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.$ref) ||
      !hasValue(ctx.dataIndex) || !hasValue(ctx.layoutIndex)
    ) { return false; }

    // Create a new Angular form control from a template in templateRefLibrary
    const newFormGroup = buildFormGroup(this.templateRefLibrary[ctx.layoutNode.$ref]);

    // Add the new form control to the parent formArray or formGroup
    if (ctx.layoutNode.arrayItem) { // Add new array item to formArray
      (<FormArray>this.getFormControlGroup(ctx)).push(newFormGroup);
    } else { // Add new $ref item to formGroup
      (<FormGroup>this.getFormControlGroup(ctx))
        .addControl(name || this.getFormControlName(ctx), newFormGroup);
    }

    // Copy a new layoutNode from layoutRefLibrary
    const newLayoutNode = getLayoutNode(ctx.layoutNode, this);
    newLayoutNode.arrayItem = ctx.layoutNode.arrayItem;
    if (ctx.layoutNode.arrayItemType) {
      newLayoutNode.arrayItemType = ctx.layoutNode.arrayItemType;
    } else {
      delete newLayoutNode.arrayItemType;
    }
    if (name) {
      newLayoutNode.name = name;
      newLayoutNode.dataPointer += '/' + JsonPointer.escape(name);
      newLayoutNode.options.title = fixTitle(name);
    }

    // Add the new layoutNode to the form layout
    JsonPointer.insert(this.layout, this.getLayoutPointer(ctx), newLayoutNode);

    return true;
  }

  moveArrayItem(ctx: any, oldIndex: number, newIndex: number): boolean {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
      !hasValue(ctx.dataIndex) || !hasValue(ctx.layoutIndex) ||
      !isDefined(oldIndex) || !isDefined(newIndex) || oldIndex === newIndex
    ) { return false; }

    // Move item in the formArray
    const formArray = <FormArray>this.getFormControlGroup(ctx);
    const arrayItem = formArray.at(oldIndex);
    formArray.removeAt(oldIndex);
    formArray.insert(newIndex, arrayItem);
    formArray.updateValueAndValidity();

    // Move layout item
    const layoutArray = this.getLayoutArray(ctx);
    layoutArray.splice(newIndex, 0, layoutArray.splice(oldIndex, 1)[0]);
    return true;
  }

  removeItem(ctx: any): boolean {
    if (
      !ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer) ||
      !hasValue(ctx.dataIndex) || !hasValue(ctx.layoutIndex)
    ) { return false; }

    // Remove the Angular form control from the parent formArray or formGroup
    if (ctx.layoutNode.arrayItem) { // Remove array item from formArray
      (<FormArray>this.getFormControlGroup(ctx))
        .removeAt(ctx.dataIndex[ctx.dataIndex.length - 1]);
    } else { // Remove $ref item from formGroup
      (<FormGroup>this.getFormControlGroup(ctx))
        .removeControl(this.getFormControlName(ctx));
    }

    // Remove layoutNode from layout
    JsonPointer.remove(this.layout, this.getLayoutPointer(ctx));
    return true;
  }
}
