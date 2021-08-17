import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { Order } from 'src/app/models/orm/order';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { QueryOperator } from 'src/app/utils/orm/operator-enum';
import { QueryRelations } from 'src/app/utils/orm/query-collection';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.page.html',
  styleUrls: ['./order-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormPage {
  public readonly order$ = this.activatedRoute.paramMap.pipe(
    // eslint-disable-next-line no-async-promise-executor
    switchMap(params => new Promise<Order>(async resolve => {
      const id = params.get('id');
      let order = await Order.findBy('id', id!);
      const orderArticles = await this.ordersApiService.getOrderArticles(order.serverId!);
      for (const orderArticle of orderArticles) {
        await orderArticle.save();
      }
      const include = new Map<keyof Order, QueryRelations<string>>();
      const orderArticlesInclude = new Map<string, QueryRelations<string>>();
      orderArticlesInclude.set('article', new Map<string, QueryRelations<string>>());
      include.set('orderArticles', orderArticlesInclude);
      order = await Order
        .all()
        .include(include)
        .filter('id', QueryOperator.equal, id!)
        .one();
      resolve(order);
    })),
    tap(order => {
      this.orderFormGroup.setValue({
        starts: order.starts.toISOString(),
        ends: order.ends?.toISOString(),
      });
    })
  );

  public orderFormGroup = this.formBuilder.group({
    starts: [undefined, Validators.required],
    ends: [undefined],
  });

  public constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute, private readonly formBuilder: FormBuilder, private readonly ordersApiService: OrdersApiService) {

  }

  public close(): void {
    void this.router.navigate(['..']);
  }

  public onSubmit(): void {
    // TODO
  }
}
