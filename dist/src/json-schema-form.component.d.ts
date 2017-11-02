import { DoCheck, EventEmitter, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FrameworkLibraryService } from './framework-library/framework-library.service';
import { WidgetLibraryService } from './widget-library/widget-library.service';
import { JsonSchemaFormService } from './json-schema-form.service';
/**
 * @module 'JsonSchemaFormComponent' - Angular JSON Schema Form
 *
 * Root module of the Angular JSON Schema Form client-side library,
 * an Angular library which generates an HTML form from a JSON schema
 * structured data model and/or a JSON Schema Form layout description.
 *
 * This library also validates input data by the user, both using individual
 * validators which provide real-time feedback while the user is filling out
 * the form, and then using the entire schema when the form is submitted,
 * to make sure the returned JSON data object is valid.
 *
 * This library is similar to, and mostly API compatible with:
 *
 * - JSON Schema Form's Angular Schema Form library for AngularJs
 *   http://schemaform.io
 *   http://schemaform.io/examples/bootstrap-example.html (examples)
 *
 * - Joshfire's JSON Form library for jQuery
 *   https://github.com/joshfire/jsonform
 *   http://ulion.github.io/jsonform/playground (examples)
 *
 * - Mozilla's react-jsonschema-form library for React
 *   https://github.com/mozilla-services/react-jsonschema-form
 *   https://mozilla-services.github.io/react-jsonschema-form (examples)
 *
 * This library depends on:
 *  - Angular (obviously)                  https://angular.io
 *  - lodash, JavaScript utility library   https://github.com/lodash/lodash
 *  - ajv, Another JSON Schema validator   https://github.com/epoberezkin/ajv
 * In addition, the Example Playground also depends on:
 *  - brace, Browserified Ace editor       http://thlorenz.github.io/brace
 */
export declare class JsonSchemaFormComponent implements DoCheck, OnChanges, OnInit, OnDestroy {
    private frameworkLibrary;
    private widgetLibrary;
    private jsf;
    private sanitizer;
    formID: number;
    debugOutput: any;
    formValueSubscription: any;
    jsfObject: any;
    schema: any;
    layout: any[];
    data: any;
    options: any;
    framework: string;
    widgets: string;
    form: any;
    model: any;
    JSONSchema: any;
    UISchema: any;
    formData: any;
    loadExternalAssets: boolean;
    debug: boolean;
    onChanges: EventEmitter<any>;
    onSubmit: EventEmitter<any>;
    isValid: EventEmitter<boolean>;
    validationErrors: EventEmitter<any>;
    formSchema: EventEmitter<any>;
    formLayout: EventEmitter<any>;
    btnClick: EventEmitter<any>;
    private subscription;
    constructor(frameworkLibrary: FrameworkLibraryService, widgetLibrary: WidgetLibraryService, jsf: JsonSchemaFormService, sanitizer: DomSanitizer);
    ngOnInit(): void;
    ngOnChanges(): void;
    readonly stylesheets: SafeResourceUrl[];
    readonly scripts: SafeResourceUrl[];
    /**
     * 'initializeForm' function
     *
     * - Update 'schema', 'layout', and 'initialValues', from inputs.
     *
     * - Create 'dataMap' to map the data to the schema and template.
     *
     * - Create 'schemaRefLibrary' to resolve schema $ref links.
     *
     * - Create 'layoutRefLibrary' to use when dynamically adding
     *   form components to arrays and recursive $ref points.
     *
     * - Create 'formGroupTemplate', then from it 'formGroup',
     *   the Angular formGroup used to control the reactive form.
     *
     * @return {void}
     */
    initializeForm(): void;
    ngDoCheck(): void;
    submitForm(): void;
    ngOnDestroy(): void;
}
