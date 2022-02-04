import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OrderRepetitionSettingsApiService } from 'src/app/services/api/order-repetition-settings-api.service';
import { SharedModule } from 'src/app/shared.module';
import { OrderRepetitionSettingFormPage } from './pages/order-repetition-setting-form/order-repetition-setting-form.page';
import { SuppliersPageRoutingModule } from './suppliers-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SuppliersPageRoutingModule,
    SharedModule,
  ],
  declarations: [OrderRepetitionSettingFormPage],
  providers: [OrderRepetitionSettingsApiService],
})
export class SuppliersPageModule {}
