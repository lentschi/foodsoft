import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Order } from 'src/app/models/orm/order';
import isBefore from 'date-fns/isBefore';
import { OrderState } from 'src/app/models/enums/order-state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-list-item',
  templateUrl: 'order-list-item.component.html',
  styleUrls: ['order-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListItemComponent {
  @Input() public order: Order;

  public constructor(private readonly router: Router) {}

  public get stateIcon(): string {
    switch (this.order.state) {
      case OrderState.open:
        if (this.order.ownGroupOrderId !== undefined) {
          return 'cart';
        }
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
    if (this.order.state === OrderState.open && this.inThePast(this.order.starts)) {
      await this.router.navigate([
        '/orders/group-order-form',
        this.order.ownGroupOrderId === undefined ? { orderId: this.order.id } : { id: this.order.ownGroupOrderId },
      ]);
    } else {
      await this.router.navigate(['/orders/form', { id: this.order.id }]);
    }
  }
}
