import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { OrdersPage } from './orders.page';
import { OrdersPageRoutingModule } from './orders-routing.module';
import { OrdersApiService } from '../services/api/orders-api.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule,
  ],
  declarations: [OrdersPage],
  providers: [OrdersApiService],
})
export class OrdersPageModule {}
