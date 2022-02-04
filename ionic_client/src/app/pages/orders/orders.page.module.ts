import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrdersPage } from './orders.page';
import { OrdersPageRoutingModule } from './orders-routing.module';
import { OrdersApiService } from '../../services/api/orders-api.service';
import { OrderListItemComponent } from './components/order-list-item/order-list-item.component';
import { DateDisplayComponent } from './components/date-display/date-display.component';
import { SuppliersApiService } from 'src/app/services/api/suppliers-api.service';
import { GroupOrdersApiService } from 'src/app/services/api/group-orders-api.service';
import { StockServiceModalComponent } from './modals/stock-service/stock-service-modal.component';
import { StockServicesApiService } from 'src/app/services/api/stock-services-api.service';
import { UserApiService } from 'src/app/services/api/user-api.service';
import { SharedModule } from 'src/app/shared.module';
import { OrderListItemContextMenuComponent } from './components/order-list-item-context-menu/order-list-item-context-menu.component';
import { ReceiveOrderFormPage } from './pages/receive-order-form/receive-order-form.page';
import { ReceiveGroupOrderFormPage } from './pages/receive-group-order-form/receive-group-order-form.page';
import { GroupOrderArticlesApiService } from 'src/app/services/api/group-order-articles-api.service';
import { BalancingApiService } from 'src/app/services/api/balancing-api.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [OrdersPage, OrderListItemComponent, DateDisplayComponent, StockServiceModalComponent, OrderListItemContextMenuComponent, ReceiveOrderFormPage, ReceiveGroupOrderFormPage],
  providers: [OrdersApiService, SuppliersApiService, GroupOrdersApiService, GroupOrderArticlesApiService, StockServicesApiService, UserApiService, BalancingApiService],
})
export class OrdersPageModule {}
