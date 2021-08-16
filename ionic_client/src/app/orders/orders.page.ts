import { ChangeDetectionStrategy,  Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { Order } from '../models/orm/order';
import { OrdersApiService } from '../services/api/orders-api.service';

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.page.html',
  styleUrls: ['orders.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage implements OnInit {
  @ViewChild('olderOrdersScroller', { static: false }) public olderOrdersScroller?: IonInfiniteScroll;

  @ViewChild('newerOrdersScroller', { static: false }) public newerOrdersScroller?: IonInfiniteScroll;

  @ViewChild(IonContent) public content: IonContent;

  public readonly orders$ = new BehaviorSubject<Order[]>([]);

  private currentLowerPage = 1;

  private currentUpperPage = 1;

  private totalPages?: number;

  public constructor(private ordersApiService: OrdersApiService) {}

  public async ngOnInit(): Promise<void> {
    this.currentLowerPage =  await this.ordersApiService.getTodaysPage();
    this.currentUpperPage = this.currentLowerPage;
    await this.fetchOrders('new', false);

    // Load one additional older page to ensure infinite scrollers work properly:
    await this.loadOlder();
  }


  public async loadNewer(): Promise<void> {
    this.currentUpperPage += 1;
    await this.fetchOrders('new');

    await this.newerOrdersScroller?.complete();
  }

  public async loadOlder(): Promise<void> {
    this.currentLowerPage -= 1;
    await this.fetchOrders('old');

    await this.olderOrdersScroller?.complete();
  }

  public get olderScrollerDisabled(): boolean {
    return this.currentLowerPage <= 1;
  }

  public get newerScrollerDisabled(): boolean {
    return this.totalPages === undefined || this.currentUpperPage >= this.totalPages;
  }

  private async fetchOrders(direction: 'old' | 'new', propagateChange = true): Promise<void> {
    const ordersResult = await this.ordersApiService.paginate({ orderBy: 'ends', orderDirection: 'asc', page: direction === 'old' ? this.currentLowerPage : this.currentUpperPage });
    this.totalPages = ordersResult.totalPages;
    const orders = this.orders$.value;
    if (direction === 'old') {
      orders.unshift(...ordersResult.results);
    } else {
      orders.push(...ordersResult.results);
    }

    if (propagateChange) {
      this.orders$.next(orders);
    }
  }
}
