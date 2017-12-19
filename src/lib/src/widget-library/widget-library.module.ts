import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrderableDirective } from '../shared/orderable.directive';

import { WidgetLibraryService } from './widget-library.service';
import { JsonSchemaFormService } from '../json-schema-form.service';

import { BASIC_WIDGETS } from './index';
import { FloatLabelDirective } from './float-label.directive';

@NgModule({
  imports:         [ CommonModule, FormsModule, ReactiveFormsModule ],
  declarations:    [ ...BASIC_WIDGETS, OrderableDirective,FloatLabelDirective ],
  exports:         [ ...BASIC_WIDGETS, OrderableDirective,FloatLabelDirective ],
  entryComponents: [ ...BASIC_WIDGETS ],
  providers:       [ JsonSchemaFormService, WidgetLibraryService ]
})
export class WidgetLibraryModule { }
