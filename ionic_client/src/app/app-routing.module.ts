import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { OrdersPageModule } from './pages/orders/orders.page.module';

const routes: Routes = [
  {
    path: 'orders',
    loadChildren: (): Promise<typeof OrdersPageModule> => import('./pages/orders/orders.page.module').then(m => m.OrdersPageModule),
  },
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
