import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FrameworkLibraryModule } from './framework-library/framework-library.module';
import { WidgetLibraryModule } from './widget-library/widget-library.module';

import { JsonSchemaFormComponent } from './json-schema-form.component';

import { JsonSchemaFormService } from './json-schema-form.service';
import { FrameworkLibraryService } from './framework-library/framework-library.service';
import { WidgetLibraryService } from './widget-library/widget-library.service';
import { FloatLabelDirective} from './widget-library/float-label.directive';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    FrameworkLibraryModule, WidgetLibraryModule
  ],
  declarations: [ JsonSchemaFormComponent,FloatLabelDirective ],
  exports: [
    JsonSchemaFormComponent, FrameworkLibraryModule, WidgetLibraryModule,FloatLabelDirective
  ],
  providers: [
    JsonSchemaFormService, FrameworkLibraryService, WidgetLibraryService
  ]
})
export class JsonSchemaFormModule { }
