import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { Order } from 'src/app/models/orm/order';
import { Supplier } from 'src/app/models/orm/supplier';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { SuppliersApiService } from 'src/app/services/api/suppliers-api.service';
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
      await this.ordersApiService.getOrderArticles(order.serverId);
      await this.suppliersApiService.show(Supplier.indexedDbToServerId(order.supplierId));

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
      const articlesFormGroup = new FormGroup({});
      for (const article of order.supplier.articles) {
        const articleSelected = order.orderArticles.some(orderArticle => orderArticle.articleId === article.id);
        articlesFormGroup.addControl(article.id, new FormControl(articleSelected));
      }
      this.orderFormGroup.setValue({
        starts: order.starts.toISOString(),
        ends: order.ends?.toISOString(),
        articles: articlesFormGroup,
      });
    })
  );


  public orderFormGroup = this.formBuilder.group({
    starts: [undefined, Validators.required],
    ends: [undefined],
    articles: new FormGroup({}),
  });

  public constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute, private readonly formBuilder: FormBuilder, private readonly ordersApiService: OrdersApiService, private readonly suppliersApiService: SuppliersApiService) {

  }

  public close(): void {
    void this.router.navigate(['..']);
  }

  public onSubmit(): void {
    // TODO
  }
}
