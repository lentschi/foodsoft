import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { ValidationErrorsComponent } from './components/validation-errors/validation-errors.component';
import { ContextMenuDirective } from './directives/context-menu.directive';
import { ContextPopoverDirective } from './directives/context-popover.directive';
import { ValidationErrorsDisplayDirective } from './directives/validation-errors-display.directive';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { AlertService } from './services/alert.service';
import { LoaderService } from './services/loader.service';
import { ToastService } from './services/toast.service';

const createTranslateLoader = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, '../assets/i18n/', '.json');

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    RouterModule,
  ],
  providers: [LoaderService, ToastService, AlertService],
  declarations: [UserAvatarComponent, UserDetailsComponent, ContextMenuComponent, ValidationErrorsComponent, FormatDatePipe, ContextPopoverDirective, ContextMenuDirective, ValidationErrorsDisplayDirective],
  exports: [UserAvatarComponent, UserDetailsComponent, ContextMenuComponent, ValidationErrorsComponent, FormatDatePipe, ContextPopoverDirective, ContextMenuDirective, ValidationErrorsDisplayDirective, TranslateModule],
})
export class SharedModule {}
