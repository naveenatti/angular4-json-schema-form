import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
export declare type CheckboxItem = {
    name: string;
    value: any;
    checked?: boolean;
};
export declare class JsonSchemaFormService {
    JsonFormCompatibility: boolean;
    ReactJsonSchemaFormCompatibility: boolean;
    AngularSchemaFormCompatibility: boolean;
    tpldata: any;
    ajvOptions: any;
    ajv: any;
    validateFormData: any;
    initialValues: any;
    schema: any;
    layout: any[];
    formGroupTemplate: any;
    formGroup: any;
    framework: any;
    data: any;
    validData: any;
    isValid: boolean;
    validationErrors: any;
    formValueSubscription: any;
    dataChanges: Subject<any>;
    isValidChanges: Subject<any>;
    validationErrorChanges: Subject<any>;
    arrayMap: Map<string, number>;
    dataMap: Map<string, any>;
    dataRecursiveRefMap: Map<string, string>;
    schemaRecursiveRefMap: Map<string, string>;
    layoutRefLibrary: any;
    schemaRefLibrary: any;
    templateRefLibrary: any;
    globalOptionDefaults: any;
    globalOptions: any;
    private subject;
    constructor();
    /**
    * @param  {any} shippingInfo
    */
    setBtnClick(shippingInfo: any): void;
    /**
     */
    getBtnClick(): Observable<any>;
    getData(): any;
    getSchema(): any;
    getLayout(): any[];
    resetAllValues(): void;
    convertJsonSchemaToDraft6(): void;
    fixJsonFormOptions(layout: any): any;
    buildFormGroupTemplate(setValues?: boolean): void;
    validateData(newValue: any, updateSubscriptions?: boolean): void;
    buildFormGroup(): void;
    buildLayout(widgetLibrary: any): void;
    setOptions(newOptions: any): void;
    compileAjvSchema(): void;
    resolveSchemaRefLinks(): void;
    buildSchemaFromData(data?: any, requireAllFields?: boolean): any;
    buildSchemaFromLayout(layout?: any): any;
    setTpldata(newTpldata?: any): void;
    parseText(text?: string, value?: any, values?: any, key?: number | string): string;
    setTitle(parentCtx?: any, childNode?: any, index?: number): string;
    initializeControl(ctx: any): boolean;
    updateValue(ctx: any, value: any): void;
    updateArrayCheckboxList(ctx: any, checkboxList: CheckboxItem[]): void;
    getControl(ctx: any): AbstractControl;
    getControlValue(ctx: any): AbstractControl;
    getControlGroup(ctx: any): FormArray | FormGroup;
    getControlName(ctx: any): string;
    getLayoutArray(ctx: any): any[];
    getParentNode(ctx: any): any[];
    getDataPointer(ctx: any): string;
    getLayoutPointer(ctx: any): string;
    isControlBound(ctx: any): boolean;
    addItem(ctx: any): boolean;
    moveArrayItem(ctx: any, oldIndex: number, newIndex: number): boolean;
    removeItem(ctx: any): boolean;
}
