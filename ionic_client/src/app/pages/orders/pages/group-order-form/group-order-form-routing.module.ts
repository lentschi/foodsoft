import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupOrderFormPage } from './group-order-form.page';


const routes: Routes = [
  {
    path: '',
    component: GroupOrderFormPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupOrderFormPageRoutingModule {}
