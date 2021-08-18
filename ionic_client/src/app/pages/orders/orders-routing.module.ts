import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdersPage } from './orders.page';
import { GroupOrderFormPageModule } from './pages/group-order-form/group-order-form.page.module';
import { OrderFormPageModule } from './pages/order-form/order-form.page.module';

const routes: Routes = [
  {
    path: 'form',
    loadChildren: (): Promise<typeof OrderFormPageModule> => import('./pages/order-form/order-form.page.module').then(m => m.OrderFormPageModule),
  },
  {
    path: 'group-order-form',
    loadChildren: (): Promise<typeof GroupOrderFormPageModule> => import('./pages/group-order-form/group-order-form.page.module').then(m => m.GroupOrderFormPageModule),
  },
  {
    path: '',
    component: OrdersPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersPageRoutingModule {}
