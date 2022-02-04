import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { orderIdUpdated$ } from 'src/app/events';
import { GroupOrder } from 'src/app/models/orm/group-order';
import { GroupOrderArticle } from 'src/app/models/orm/group-order-article';
import { Order } from 'src/app/models/orm/order';
import { OrderArticle } from 'src/app/models/orm/order-article';
import { GroupOrdersApiService } from 'src/app/services/api/group-orders-api.service';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import { QueryRelations } from 'src/app/utils/orm/query-collection';

@Component({
  selector: 'app-group-order-form',
  templateUrl: './group-order-form.page.html',
  styleUrls: ['./group-order-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupOrderFormPage {
  public readonly groupOrder$ = this.activatedRoute.paramMap.pipe(
    switchMap(params => from(this.getGroupOrderForParams(params)).pipe(startWith(undefined))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public readonly orderFormGroup$ = this.groupOrder$.pipe(
    map(groupOrder => {
      if (groupOrder === undefined) {
        return undefined;
      }
      const articlesFormGroup = new FormGroup({});
      const orderFormGroup = new FormGroup({
        articles: articlesFormGroup,
      });

      for (const groupOrderArticle of groupOrder.groupOrderArticles) {
        articlesFormGroup.addControl(groupOrderArticle.orderArticle.id, new FormGroup({
          quantity: new FormControl(groupOrderArticle.quantity, [Validators.required]),
          tolerance: new FormControl(groupOrderArticle.tolerance, [Validators.required]),
        }));
      }

      return orderFormGroup;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );


  public constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ordersApiService: OrdersApiService,
    private readonly groupOrdersApiService: GroupOrdersApiService,
    private readonly loaderService: LoaderService,
    private readonly toastService: ToastService,
    private readonly translateService: TranslateService
  ) {
  }

  public async close(): Promise<void> {
    await this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
  }

  public async onSubmit(): Promise<void> {
    const loader = await this.loaderService.present();
    try {
      const groupOrder = await this.groupOrder$.pipe(take(1)).toPromise();
      const form = await this.orderFormGroup$.pipe(take(1)).toPromise();
      const articlesGroup = <FormGroup> form!.get('articles');
      const goas = Object.entries(articlesGroup.controls).map(([key, group]) => {
        const goa = new GroupOrderArticle();
        goa.quantity = parseInt(group.get('quantity')!.value, 10);
        goa.tolerance = parseInt(group.get('tolerance')!.value, 10);
        goa.orderArticleId = String(OrderArticle.indexedDbToServerId(key));

        return goa;
      });
      await this.groupOrdersApiService.saveAmounts(groupOrder!, goas);
      orderIdUpdated$.next(groupOrder!.order.id);
      await this.close();
      await this.toastService.present(this.translateService.instant('Group order successfully saved.'));
    } finally {
      await loader.dismiss();
    }
  }

  private getGroupOrderForParams(params: ParamMap): Promise<GroupOrder> {
    const orderId = params.get('orderId');
    if (orderId !== null) {
      return this.createGroupOrderForOrder(orderId);
    }

    const id = params.get('id');
    if (id === null) {
      throw new Error('Tried to open group order form without either orderId or id');
    }

    return this.fetchGroupOrder(parseInt(id, 10));
  }

  private async fetchGroupOrder(id: number): Promise<GroupOrder> {
    const groupOrder = await this.groupOrdersApiService.get(id);
    const orderArticles = await this.ordersApiService.getOrderArticles(Order.indexedDbToServerId(groupOrder.orderId));
    groupOrder.order = await Order.findBy('id', groupOrder.orderId);
    const goas = groupOrder.groupOrderArticles;
    groupOrder.groupOrderArticles = orderArticles.map(orderArticle => this.getGroupOrderArticleForOrderArticle(orderArticle, goas));
    return groupOrder;
  }

  private getGroupOrderArticleForOrderArticle(orderArticle: OrderArticle, groupOrderArticles: GroupOrderArticle[]): GroupOrderArticle {
    const groupOrderArticle = groupOrderArticles.find(goa => goa.orderArticleId === orderArticle.id) ?? new GroupOrderArticle();
    groupOrderArticle.orderArticle = orderArticle;
    groupOrderArticle.orderArticleId = orderArticle.id;
    if (groupOrderArticle.quantity === undefined) {
      groupOrderArticle.quantity = 0;
    }

    if (groupOrderArticle.tolerance === undefined) {
      groupOrderArticle.tolerance = 0;
    }

    return groupOrderArticle;
  }

  private async createGroupOrderForOrder(orderId: string): Promise<GroupOrder> {
    const order = await Order.findBy('id', orderId);
    const orderArticles = await this.ordersApiService.getOrderArticles(order.serverId);

    const include = new Map<keyof Order, QueryRelations<string>>();

    const orderArticlesInclude = new Map<string, QueryRelations<string>>();
    orderArticlesInclude.set('article', new Map<string, QueryRelations<string>>());

    include.set('orderArticles', orderArticlesInclude);

    const groupOrder = new GroupOrder();
    groupOrder.order = order;
    groupOrder.orderId = order.id;
    groupOrder.groupOrderArticles = orderArticles.map(orderArticle => {
      const groupOrderArticle = new GroupOrderArticle();
      groupOrderArticle.orderArticle = orderArticle;
      groupOrderArticle.orderArticleId = orderArticle.id;
      groupOrderArticle.quantity = 0;
      groupOrderArticle.tolerance = 0;

      return groupOrderArticle;
    });
    return groupOrder;
  }
}
