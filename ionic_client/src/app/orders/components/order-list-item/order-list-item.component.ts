import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Order } from 'src/app/models/orm/order';

@Component({
  selector: 'app-order-list-item',
  templateUrl: 'order-list-item.component.html',
  styleUrls: ['order-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListItemComponent {
  @Input() public order: Order;
}
