import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SchemaPrimitiveType, IValidatorFn, AsyncIValidatorFn } from './validator.functions';
import { JsonSchemaFormatNames } from './format-regex.constants';
export declare class JsonValidators {
    static required(input: AbstractControl): ValidationErrors | null;
    static required(input?: boolean): IValidatorFn;
    static type(requiredType: SchemaPrimitiveType | SchemaPrimitiveType[]): IValidatorFn;
    static enum(allowedValues: any[]): IValidatorFn;
    static const(requiredValue: any): IValidatorFn;
    static equalTo(equalField: string): IValidatorFn;
    static dobFormat(dateValue: any): IValidatorFn;
    static minLength(minimumLength: number): IValidatorFn;
    static maxLength(maximumLength: number): IValidatorFn;
    static pattern(pattern: string | RegExp, wholeString?: boolean): IValidatorFn;
    static format(requiredFormat: JsonSchemaFormatNames): IValidatorFn;
    static minimum(minimumValue: number): IValidatorFn;
    static exclusiveMinimum(exclusiveMinimumValue: number): IValidatorFn;
    static maximum(maximumValue: number): IValidatorFn;
    static exclusiveMaximum(exclusiveMaximumValue: number): IValidatorFn;
    static multipleOf(multipleOfValue: number): IValidatorFn;
    static minProperties(minimumProperties: number): IValidatorFn;
    static maxProperties(maximumProperties: number): IValidatorFn;
    static dependencies(dependencies: any): IValidatorFn;
    static minItems(minimumItems: number): IValidatorFn;
    static maxItems(maximumItems: number): IValidatorFn;
    static uniqueItems(unique?: boolean): IValidatorFn;
    static contains(requiredItem?: boolean): IValidatorFn;
    static nullValidator(control: AbstractControl): ValidationErrors | null;
    static composeAnyOf(validators: IValidatorFn[]): IValidatorFn;
    static composeOneOf(validators: IValidatorFn[]): IValidatorFn;
    static composeAllOf(validators: IValidatorFn[]): IValidatorFn;
    static composeNot(validator: IValidatorFn): IValidatorFn;
    static compose(validators: IValidatorFn[]): IValidatorFn;
    static composeAsync(validators: AsyncIValidatorFn[]): AsyncIValidatorFn;
    static min(min: number): ValidatorFn;
    static max(max: number): ValidatorFn;
    static requiredTrue(control: AbstractControl): ValidationErrors | null;
    static email(control: AbstractControl): ValidationErrors | null;
}
