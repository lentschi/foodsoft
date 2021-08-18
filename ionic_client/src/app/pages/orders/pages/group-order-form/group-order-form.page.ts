import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { Order } from 'src/app/models/orm/order';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { QueryOperator } from 'src/app/utils/orm/operator-enum';
import { QueryRelations } from 'src/app/utils/orm/query-collection';

@Component({
  selector: 'app-group-order-form',
  templateUrl: './group-order-form.page.html',
  styleUrls: ['./group-order-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupOrderFormPage {
  public readonly order$ = this.activatedRoute.paramMap.pipe(
    // eslint-disable-next-line no-async-promise-executor
    switchMap(params => new Promise<Order>(async resolve => {
      const id = params.get('orderId');
      let order = await Order.findBy('id', id!);
      await this.ordersApiService.getOrderArticles(order.serverId);

      const include = new Map<keyof Order, QueryRelations<string>>();

      const orderArticlesInclude = new Map<string, QueryRelations<string>>();
      orderArticlesInclude.set('article', new Map<string, QueryRelations<string>>());

      const supplierInclude = new Map<string, QueryRelations<string>>();
      supplierInclude.set('articles', new Map<string, QueryRelations<string>>());

      include.set('orderArticles', orderArticlesInclude);
      include.set('supplier', supplierInclude);

      order = await Order
        .all()
        .include(include)
        .filter('id', QueryOperator.equal, id!)
        .one();
      resolve(order);
    })),
    tap(order => {
      for (const controlKey of Object.keys(this.articlesFormGroup.controls)) {
        this.articlesFormGroup.removeControl(controlKey);
      }
      for (const orderArticle of order.orderArticles) {
        this.articlesFormGroup.addControl(orderArticle.article.id, new FormControl(0));
      }
    })
  );

  public readonly articlesFormGroup = new FormGroup({});

  public orderFormGroup = this.formBuilder.group({
    articles: this.articlesFormGroup,
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
