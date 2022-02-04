import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Order } from 'src/app/models/orm/order';
import isBefore from 'date-fns/isBefore';
import { OrderState } from 'src/app/models/enums/order-state';

@Component({
  selector: 'app-order-list-item-context-menu',
  templateUrl: './order-list-item-context-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListItemContextMenuComponent  {
  @Input() public order: Order;

  public constructor(public readonly popoverController: PopoverController) { }

  public inThePast(date?: Date): boolean {
    if (!date) {
      return false;
    }

    return isBefore(date, new Date());
  }

  public get hasGroupOrder(): boolean {
    return this.order.state === OrderState.open && this.inThePast(this.order.starts);
  }
}
