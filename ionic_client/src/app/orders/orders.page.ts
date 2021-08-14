import { Component } from '@angular/core';
import { OrdersApiService } from '../services/api/orders-api.service';

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.page.html',
  styleUrls: ['orders.page.scss'],
})
export class OrdersPage {
  public constructor(private ordersApiService: OrdersApiService) {}

  public async test(): Promise<void> {
    const orders = await this.ordersApiService.paginate({ by: 'ends', orderDirection: 'desc' });

    // const user = new User();
    // user.name = 'Flo';
    // await user.save();
    // const collection = User.all();
    // const single = await collection.list();
    // const single = await User.all().filter('id', QueryOperator.equal, 'e014e950-f69c-11eb-9768-39e4ab00da53')
    //   .one();
    console.log('resp', orders);
  }
}
