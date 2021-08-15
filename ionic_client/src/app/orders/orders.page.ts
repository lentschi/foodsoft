import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, IonVirtualScroll } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { Order } from '../models/order';
import { OrdersApiService } from '../services/api/orders-api.service';

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.page.html',
  styleUrls: ['orders.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage implements OnInit {
  @ViewChild(IonVirtualScroll) public virtualScroll: IonVirtualScroll;

  @ViewChild(IonInfiniteScroll) public infiniteScroll: IonInfiniteScroll;

  public orders$ = new BehaviorSubject<Order[]>([]);

  private curPage = 0;

  public constructor(private ordersApiService: OrdersApiService) {}

  public async ngOnInit(): Promise<void> {
    const ordersResult = await this.ordersApiService.paginate({ orderBy: 'ends', orderDirection: 'desc' });

    // const user = new User();
    // user.name = 'Flo';
    // await user.save();
    // const collection = User.all();
    // const single = await collection.list();
    // const single = await User.all().filter('id', QueryOperator.equal, 'e014e950-f69c-11eb-9768-39e4ab00da53')
    //   .one();
    console.log('resp', ordersResult);
    this.orders$.next(ordersResult.results);
  }

  public async loadData(): Promise<void> {
    this.curPage += 1;
    const ordersResult = await this.ordersApiService.paginate({ orderBy: 'ends', orderDirection: 'desc', page: this.curPage });
    const orders = this.orders$.value;
    orders.push(...ordersResult.results);
    this.orders$.next(orders);

    await this.infiniteScroll.complete();

    if (this.curPage === ordersResult.totalPages) {
      this.infiniteScroll.disabled = true;
    }

    this.virtualScroll.checkEnd();
  }
}
