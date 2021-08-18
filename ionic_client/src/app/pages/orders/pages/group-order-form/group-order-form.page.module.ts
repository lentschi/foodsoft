import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GroupOrderFormPageRoutingModule } from './group-order-form-routing.module';
import { GroupOrderFormPage } from './group-order-form.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupOrderFormPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [GroupOrderFormPage],
})
export class GroupOrderFormPageModule {}
