import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { OrdersPageModule } from './pages/orders/orders.page.module';
import { FoodcoopRouteGuard } from './route-guards/foodcoop.route-guard';
import { DefaultFoodcoopApiService } from './services/api/default-foodcoop-api.service';

const routes: Routes = [
  {
    path: ':foodcoop',
    children: [
      {
        path: 'orders',
        loadChildren: (): Promise<typeof OrdersPageModule> => import('./pages/orders/orders.page.module').then(m => m.OrdersPageModule),
      },
      {
        path: 'suppliers',
        loadChildren: (): Promise<typeof OrdersPageModule> => import('./pages/suppliers/suppliers.page.module').then(m => m.SuppliersPageModule),
      },
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full',
      },
    ],
  }, {
    path: '',
    canActivate: [FoodcoopRouteGuard],
    children: [],
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [FoodcoopRouteGuard, DefaultFoodcoopApiService],
})
export class AppRoutingModule { }
