import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { OrdersPageModule } from './orders/orders.page.module';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: (): Promise<typeof OrdersPageModule> => import('./orders/orders.page.module').then(m => m.OrdersPageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
