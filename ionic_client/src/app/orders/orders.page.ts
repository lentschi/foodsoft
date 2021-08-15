import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
  public orders$ = new BehaviorSubject<Order[]>([]);

  public constructor(private ordersApiService: OrdersApiService) {}

  public async ngOnInit(): Promise<void> {
    const ordersResult = await this.ordersApiService.paginate({ by: 'ends', orderDirection: 'desc' });

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
}
