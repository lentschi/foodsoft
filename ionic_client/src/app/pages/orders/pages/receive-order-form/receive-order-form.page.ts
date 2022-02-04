import { ChangeDetectionStrategy,  Component } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { switchMap, startWith, shareReplay, tap, map } from 'rxjs/operators';
import { orderIdUpdated$ } from 'src/app/events';
import { Order } from 'src/app/models/orm/order';
import { OrderArticle } from 'src/app/models/orm/order-article';
import { OfflineModeError } from 'src/app/services/api/errors/offline-mode-error';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import { QueryOperator } from 'src/app/utils/orm/operator-enum';
import { QueryRelations } from 'src/app/utils/orm/query-collection';

@Component({
  selector: 'app-receive-order-form',
  templateUrl: './receive-order-form.page.html',
  styleUrls: ['./receive-order-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveOrderFormPage {
  public readonly articlesFormGroup = new FormGroup({});

  public orderFormGroup = this.formBuilder.group({
    articles: this.articlesFormGroup,
    restToTolerance: [true, Validators.required],
  });

  public readonly order$ = this.activatedRoute.paramMap.pipe(
    switchMap(params => from(this.getOrderFromParams(params)).pipe(startWith(undefined))),
    tap(orderFetchResult => {
      for (const controlKey of Object.keys(this.articlesFormGroup.controls)) {
        this.articlesFormGroup.removeControl(controlKey);
      }
      if (orderFetchResult === undefined) {
        this.orderFormGroup.reset();
        return;
      }
      for (const orderArticle of orderFetchResult.order.orderArticles) {
        this.articlesFormGroup.addControl(orderArticle.id, new FormGroup({
          unitsReceived: new FormControl(orderArticle.unitsReceived),
        }));
      }
      this.orderFormGroup.patchValue({
        restToTolerance: true,
      });

      if (orderFetchResult.offlineMode) {
        this.orderFormGroup.disable();
      } else {
        this.orderFormGroup.enable();
      }
    }),
    map(orderInfo => orderInfo?.order),
    shareReplay({ bufferSize: 1, refCount: true })
  );


  public constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly ordersApiService: OrdersApiService,
    private readonly loaderService: LoaderService,
    private readonly toastService: ToastService,
    private readonly translateService: TranslateService,
  ) {
  }

  public async close(): Promise<void> {
    await this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }

  public async onSubmit(order: Order): Promise<void> {
    const loader = await this.loaderService.present();
    try {
      const restToTolerance: boolean = this.orderFormGroup.get('restToTolerance')?.value;
      const articlesGroup = <FormGroup> this.orderFormGroup.get('articles');

      for (const orderArticle of order.orderArticles) {
        let formReceivedValue = articlesGroup.controls[orderArticle.id].get('unitsReceived')?.value;
        if (formReceivedValue === '') {
          formReceivedValue = undefined;
        }
        if (formReceivedValue !== undefined) {
          formReceivedValue = parseFloat(formReceivedValue);
        }
        orderArticle.unitsReceived = formReceivedValue ?? orderArticle.unitsToOrder;
      }

      await this.ordersApiService.receive(order, order.orderArticles, restToTolerance);
      orderIdUpdated$.next(order.id);
      await this.close();
      await this.toastService.present(this.translateService.instant('Group order successfully saved.'));
    } finally {
      await loader.dismiss();
    }
  }

  public getRelevantOrderArticles(order: Order): OrderArticle[] {
    return order.orderArticles.filter(orderArticle => orderArticle.unitsToOrder > 0);
  }

  private async getOrderFromParams(params: ParamMap): Promise<{order: Order; offlineMode: boolean;}> {
    let offlineMode = false;
    const id = params.get('id');
    let order = await Order.findBy('id', id!);

    try {
      await this.ordersApiService.getOrderArticles(order.serverId);
    } catch (e) {
      if (e instanceof OfflineModeError) {
        offlineMode = true;
      } else {
        throw e;
      }
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

    return { order, offlineMode };
  }
}
