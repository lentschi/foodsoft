import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Order } from 'src/app/models/orm/order';
import isBefore from 'date-fns/isBefore';
import { OrderState } from 'src/app/models/enums/order-state';
import { ModalController } from '@ionic/angular';
import { StockServiceModalComponent } from '../../modals/stock-service/stock-service-modal.component';
import { ContextMenuConfig } from 'src/app/models/interfaces/context-menu-config';
import { TranslateService } from '@ngx-translate/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { BalancingApiService } from 'src/app/services/api/balancing-api.service';

@Component({
  selector: 'app-order-list-item',
  templateUrl: 'order-list-item.component.html',
  styleUrls: ['order-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListItemComponent implements OnDestroy {
  @Input() public order: Order;

  public readonly OrderState = OrderState;

  public focusFadeout = false;

  private currentFocused = false;

  private readonly destroy$ = new Subject<void>();

  public constructor(
    private readonly modalCtrl: ModalController,
    private readonly translateService: TranslateService,
    private readonly alertService: AlertService,
    private readonly loaderService: LoaderService,
    private readonly ordersApiService: OrdersApiService,
    private readonly balancingApiService: BalancingApiService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  @Input() public set focused(focus: boolean) {
    if (focus && !this.currentFocused) {
      // Workaround for inability to use @keyframes - see https://github.com/w3c/csswg-drafts/issues/1516
      this.focusFadeout = false;
      this.cd.markForCheck();

      // TODO: This is ugly - maybe there's a solution using angular lifecycles only:
      timer(100).pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.focusFadeout = true;
          this.cd.markForCheck();
        });
    }
    this.currentFocused = focus;
  }

  public get focused(): boolean {
    return this.currentFocused;
  }


  public get stateIcon(): string {
    switch (this.order.state) {
      case OrderState.planned:
        return 'timer-outline';
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

  public get contextMenuConfig(): ContextMenuConfig {
    const canPostGroupOrders = this.order.state === OrderState.open && this.inThePast(this.order.starts);
    return [
      {
        label: this.translateService.instant('place group order'),
        routerLink: ['group-order-form', { orderId: this.order.id }],
        show: canPostGroupOrders && this.order.ownGroupOrderId === undefined,
      },
      {
        label: this.translateService.instant('finish order'),
        callbackFn: (): unknown => this.finishOrder(),
        show: canPostGroupOrders,
      },
      {
        label: this.translateService.instant('self service'),
        routerLink: ['receive-group-order-form', { id: this.order.ownGroupOrderId }],
        show: this.order.state === OrderState.received && this.order.ownGroupOrderId !== undefined,
      },
      {
        label: this.translateService.instant(this.order.state === OrderState.received ? 'correct received amounts' : 'receive order'),
        routerLink: ['receive-order-form', { id: this.order.id }],
        show: [OrderState.received, OrderState.finished].includes(this.order.state),
      },
      {
        label: this.translateService.instant('edit group order'),
        routerLink: ['group-order-form', { id: this.order.ownGroupOrderId }],
        show: canPostGroupOrders && this.order.ownGroupOrderId !== undefined,
      },
      {
        label: this.translateService.instant('create order'),
        routerLink: [
          'form', {
            supplierId: this.order.supplierId,
            starts: this.order.starts.getTime(),
            ends: this.order.ends?.getTime(),
            pickup: this.order.pickup?.getTime(),
          },
        ],
        show: this.order.state === OrderState.planned,
      },
      {
        label: this.translateService.instant('edit order'),
        routerLink: ['form', { id: this.order.id }],
        show: this.order.state !== OrderState.planned,
      },
      {
        label: this.translateService.instant('delete order'),
        callbackFn: (): unknown => this.deleteOrder(),
        show: ![OrderState.planned, OrderState.closed, OrderState.finished].includes(this.order.state),
      },
      {
        label: this.translateService.instant('balance order'),
        callbackFn: (): unknown => this.balanceOrder(),
        show: [OrderState.finished, OrderState.received].includes(this.order.state),
      },
      {
        label: this.translateService.instant('automated repetition'),
        routerLink: ['../../suppliers/order-repetition-setting-form', { id: this.order.supplierId }],
      },
    ];
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


  public async onAvatarClick(event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const modal = await this.modalCtrl.create({ component: StockServiceModalComponent, componentProps: { order: this.order } });
    await modal.present();
  }

  private async deleteOrder(): Promise<void> {
    const shouldDelete = await this.alertService.confirm(this.translateService.instant('Do you really want to delete this order? (Cannot be undone!)'));
    if (!shouldDelete) {
      return;
    }

    const loader = await this.loaderService.present();
    try {
      await this.ordersApiService.delete(this.order);
    } finally {
      await loader.dismiss();
    }
  }

  private async balanceOrder(): Promise<void> {
    const shouldBalance = await this.alertService.confirm(this.translateService.instant('Do you really want to balance this order? (Cannot be undone!)'));
    if (!shouldBalance) {
      return;
    }

    const loader = await this.loaderService.present();
    try {
      await this.balancingApiService.close(this.order);
    } finally {
      await loader.dismiss();
    }
  }

  private async finishOrder(): Promise<void> {
    const shouldFinish = await this.alertService.confirm(this.translateService.instant('Do you really want to finish this order now?'));
    if (!shouldFinish) {
      return;
    }

    const loader = await this.loaderService.present();
    try {
      await this.ordersApiService.finish(this.order);
    } finally {
      await loader.dismiss();
    }
  }
}
