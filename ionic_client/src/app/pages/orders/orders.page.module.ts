import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { OrdersPage } from './orders.page';
import { OrdersPageRoutingModule } from './orders-routing.module';
import { OrdersApiService } from '../../services/api/orders-api.service';
import { OrderListItemComponent } from './components/order-list-item/order-list-item.component';
import { DateDisplayComponent } from './components/date-display/date-display.component';
import { SuppliersApiService } from 'src/app/services/api/suppliers-api.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule,
  ],
  declarations: [OrdersPage, OrderListItemComponent, DateDisplayComponent],
  providers: [OrdersApiService, SuppliersApiService],
})
export class OrdersPageModule {}
