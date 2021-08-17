import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Order } from 'src/app/models/orm/order';
import isBefore from 'date-fns/isBefore';
import { OrderState } from 'src/app/models/enums/order-state';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';

@Component({
  selector: 'app-order-list-item',
  templateUrl: 'order-list-item.component.html',
  styleUrls: ['order-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListItemComponent {
  @Input() public order: Order;

  public constructor(private readonly ordersApiService: OrdersApiService) {}

  public get stateIcon(): string {
    switch (this.order.state) {
      case OrderState.open:
        return this.inThePast(this.order.starts) ? 'cart-outline' : 'timer-outline';
      case OrderState.finished: return 'mail-outline';
      case OrderState.received: return 'bag-check-outline';
      case OrderState.closed: return 'cash-outline';
      default: return '';
    }
  }

  public inTheFuture(date?: Date): boolean {
    if (!date) {
      return false;
    }

    return isBefore(new Date(), date);
  }

  public inThePast(date?: Date): boolean {
    if (!date) {
      return false;
    }

    return isBefore(date, new Date());
  }

  public async onClick(): Promise<void> {
    // TODO
  }
}
