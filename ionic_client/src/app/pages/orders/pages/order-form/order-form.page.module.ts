import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrderFormPage } from './order-form.page';
import { OrderFormPageRoutingModule } from './order-form-routing.module';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderFormPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [OrderFormPage],
})
export class OrderFormPageModule {}
