import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderRepetitionSettingFormPage } from './pages/order-repetition-setting-form/order-repetition-setting-form.page';

const routes: Routes = [
  {
    path: 'order-repetition-setting-form',
    component: OrderRepetitionSettingFormPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuppliersPageRoutingModule {}
