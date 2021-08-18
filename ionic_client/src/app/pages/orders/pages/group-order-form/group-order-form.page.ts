import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { GroupOrder } from 'src/app/models/orm/group-order';
import { GroupOrderArticle } from 'src/app/models/orm/group-order-article';
import { Order } from 'src/app/models/orm/order';
import { OrderArticle } from 'src/app/models/orm/order-article';
import { GroupOrdersApiService } from 'src/app/services/api/group-orders-api.service';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { QueryRelations } from 'src/app/utils/orm/query-collection';

@Component({
  selector: 'app-group-order-form',
  templateUrl: './group-order-form.page.html',
  styleUrls: ['./group-order-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupOrderFormPage {
  public readonly groupOrder$ = this.activatedRoute.paramMap.pipe(
    // eslint-disable-next-line no-async-promise-executor
    switchMap(params => this.getGroupOrderForParams(params)),
    tap(groupOrder => {
      for (const controlKey of Object.keys(this.articlesFormGroup.controls)) {
        this.articlesFormGroup.removeControl(controlKey);
      }
      for (const groupOrderArticle of groupOrder.groupOrderArticles) {
        this.articlesFormGroup.addControl(groupOrderArticle.orderArticle.article.id, new FormControl(groupOrderArticle.quantity));
      }
    })
  );

  public readonly articlesFormGroup = new FormGroup({});

  public orderFormGroup = this.formBuilder.group({
    articles: this.articlesFormGroup,
  });

  public constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute, private readonly formBuilder: FormBuilder, private readonly ordersApiService: OrdersApiService, private readonly groupOrdersApiService: GroupOrdersApiService) {

  }

  public close(): void {
    void this.router.navigate(['..']);
  }

  public onSubmit(): void {
    // TODO
  }

  private async getGroupOrderForParams(params: ParamMap): Promise<GroupOrder> {
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
    groupOrder.groupOrderArticles = orderArticles.map(orderArticle => this.extractGoa(orderArticle, goas));
    return groupOrder;
  }

  private extractGoa(orderArticle: OrderArticle, goas: GroupOrderArticle[]): GroupOrderArticle {
    const groupOrderArticle = new GroupOrderArticle();
    groupOrderArticle.orderArticle = orderArticle;
    groupOrderArticle.orderArticleId = orderArticle.id;
    groupOrderArticle.quantity = goas.find(goa => goa.orderArticleId === orderArticle.id)?.quantity ?? 0;

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

      return groupOrderArticle;
    });
    return groupOrder;
  }
}
