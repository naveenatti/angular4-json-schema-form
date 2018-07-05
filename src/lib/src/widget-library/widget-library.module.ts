import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrderableDirective } from '../shared/orderable.directive';

import { JsonSchemaFormService } from '../json-schema-form.service';

import { BASIC_WIDGETS } from './index';
import { FloatLabelDirective } from './float-label.directive';
import { InputFocusOutDirective } from './input-focusout.directive';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [...BASIC_WIDGETS, OrderableDirective, FloatLabelDirective, InputFocusOutDirective],
  exports: [...BASIC_WIDGETS, OrderableDirective, FloatLabelDirective, InputFocusOutDirective],
  entryComponents: [...BASIC_WIDGETS],
  providers: [JsonSchemaFormService]
})
export class WidgetLibraryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: WidgetLibraryModule,
      providers: [JsonSchemaFormService]
    };
  }
}
