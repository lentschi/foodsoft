import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { orderIdUpdated$ } from 'src/app/events';
import { Article } from 'src/app/models/orm/article';
import { Order } from 'src/app/models/orm/order';
import { Supplier } from 'src/app/models/orm/supplier';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { SuppliersApiService } from 'src/app/services/api/suppliers-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import ValidationUtil from 'src/app/utils/misc/validation-util';
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
    switchMap(params => from(this.getOrderFromParams(params)).pipe(startWith(undefined))),
    tap(order => {
      for (const controlKey of Object.keys(this.articlesFormGroup.controls)) {
        this.articlesFormGroup.removeControl(controlKey);
      }
      if (order === undefined) {
        this.orderFormGroup.reset();
        return;
      }
      for (const article of order.supplier.articles) {
        const articleSelected = order.orderArticles.some(orderArticle => orderArticle.articleId === article.id);
        this.articlesFormGroup.addControl(article.id, new FormControl(articleSelected));
      }
      this.orderFormGroup.patchValue({
        starts: order.starts.toISOString(),
        pickup: order.pickup?.toISOString(),
        ends: order.ends?.toISOString(),
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly articlesFormGroup = new FormGroup({});

  public readonly orderFormGroup = this.formBuilder.group({
    starts: [undefined, Validators.required],
    ends: [undefined],
    pickup: [undefined],
    articles: this.articlesFormGroup,
  });


  public constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly ordersApiService: OrdersApiService,
    private readonly suppliersApiService: SuppliersApiService,
    private readonly loaderService: LoaderService,
    private readonly toastService: ToastService,
    private readonly translateService: TranslateService,
  ) {
  }

  public async close(): Promise<void> {
    await this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
  }

  public async onSubmit(order: Order): Promise<void> {
    const loader = await this.loaderService.present();
    try {
      const data = { ...this.orderFormGroup.value };

      data.article_ids = [];
      for (const [key, value] of Object.entries(data.articles)) {
        if (value) {
          data.article_ids.push(Article.indexedDbToServerId(key));
        }
      }

      if (order.id === undefined) {
        data.supplier_id = Supplier.indexedDbToServerId(order.supplierId);
      } else {
        // TODO: Handle this properly:
        data.ignore_warnings = true;
      }
      delete data.articles;
      const savedOrder = await this.ordersApiService.save(order, data);

      // TODO: Maybe include this in order GET:
      await this.ordersApiService.getOrderArticles(savedOrder.serverId);

      orderIdUpdated$.next(savedOrder.id);
      await this.close();
      await this.toastService.present(this.translateService.instant('Order successfully saved.'));
    } catch (e) {
      ValidationUtil.setFormErrors(this.orderFormGroup, e);
    } finally {
      await loader.dismiss();
    }
  }

  private async getOrderFromParams(params: ParamMap): Promise<Order> {
    const id = params.get('id');

    let order: Order;
    if (id === undefined || id === null) {
      order = new Order();
      order.supplierId = params.get('supplierId')!;
      order.supplier = await this.suppliersApiService.get(Supplier.indexedDbToServerId(order.supplierId));
      order.name = order.supplier.name;
      order.starts = params.has('starts') ? new Date(Number(params.get('starts')!)) : new Date();
      order.pickup = params.has('pickup') ? new Date(Number(params.get('pickup')!)) : new Date();
      order.ends = params.has('ends') ? new Date(Number(params.get('ends')!)) : new Date();
      order.orderArticles = [];
    } else {
      order = await Order.findBy('id', id);
      await this.ordersApiService.getOrderArticles(order.serverId);
      await this.suppliersApiService.get(Supplier.indexedDbToServerId(order.supplierId));

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
        .filter('id', QueryOperator.equal, id)
        .one();
    }


    return order;
  }
}
