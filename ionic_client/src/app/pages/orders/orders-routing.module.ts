import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdersPage } from './orders.page';
import { OrderFormPageModule } from './pages/order-form.page.module';

const routes: Routes = [
  {
    path: 'form',
    loadChildren: (): Promise<typeof OrderFormPageModule> => import('./pages/order-form.page.module').then(m => m.OrderFormPageModule),
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
