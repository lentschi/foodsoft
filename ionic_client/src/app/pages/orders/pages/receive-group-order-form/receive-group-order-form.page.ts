import { ChangeDetectionStrategy,  Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from, Subject } from 'rxjs';
import { switchMap, startWith, shareReplay, takeUntil, take } from 'rxjs/operators';
import { GroupOrder } from 'src/app/models/orm/group-order';
import { GroupOrderArticle } from 'src/app/models/orm/group-order-article';
import { Order } from 'src/app/models/orm/order';
import { OrderArticle } from 'src/app/models/orm/order-article';
import { GroupOrderArticlesApiService } from 'src/app/services/api/group-order-articles-api.service';
import { GroupOrdersApiService } from 'src/app/services/api/group-orders-api.service';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-receive-group-order-form',
  templateUrl: './receive-group-order-form.page.html',
  styleUrls: ['./receive-group-order-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveGroupOrderFormPage implements OnInit, OnDestroy {
  public readonly groupOrder$ = this.activatedRoute.paramMap.pipe(
    switchMap(params => from(this.getGroupOrderForParams(params)).pipe(startWith(undefined))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public readonly articlesFormGroup = new FormGroup({});

  public groupOrderFormGroup = this.formBuilder.group({
    articles: this.articlesFormGroup,
  });

  private readonly destroy$ = new Subject<void>();


  public constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly ordersApiService: OrdersApiService,
    private readonly groupOrdersApiService: GroupOrdersApiService,
    private readonly groupOrderArticlesApiService: GroupOrderArticlesApiService
  ) {

  }

  public ngOnInit(): void {
    this.groupOrder$.pipe(takeUntil(this.destroy$)).subscribe(groupOrder => {
      for (const controlKey of Object.keys(this.articlesFormGroup.controls)) {
        this.articlesFormGroup.removeControl(controlKey);
      }

      if (groupOrder === undefined) {
        this.groupOrderFormGroup.reset();
        return;
      }
      for (const groupOrderArticle of groupOrder.groupOrderArticles.filter(goa => goa.id !== undefined)) {
        const formControl = new FormControl(groupOrderArticle.result ?? 0, { updateOn: 'blur' });
        this.articlesFormGroup.addControl(groupOrderArticle.id, formControl);
        formControl.valueChanges.subscribe(async result => {
          console.log('arti', result);
          await this.groupOrderArticlesApiService.save(groupOrderArticle, { result });
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  public async close(): Promise<void> {
    await this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }

  public getRelevantGroupOrderArticles(groupOrder: GroupOrder): GroupOrderArticle[] {
    return groupOrder.groupOrderArticles.filter(goa => goa.id !== undefined);
  }

  private getGroupOrderForParams(params: ParamMap): Promise<GroupOrder> {
    const id = params.get('id');
    if (id === null) {
      throw new Error('Tried to open group order form without either orderId or id');
    }

    return this.fetchGroupOrder(parseInt(id, 10));
  }

  // TODO: Move the following two method to service/model (duplicate code with group order form page):
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

    if (groupOrderArticle.result === undefined) {
      groupOrderArticle.result = 0;
    }

    return groupOrderArticle;
  }
}
