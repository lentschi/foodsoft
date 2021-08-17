import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Order } from 'src/app/models/orm/order';
import { OrdersApiService } from 'src/app/services/api/orders-api.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.page.html',
  styleUrls: ['./order-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFormPage {
  public readonly data$ = this.activatedRoute.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');
      return Order.findBy('id', id!);
    }),
    switchMap(order => combineLatest([of(order), this.ordersApiService.getOrderArticles(order.serverId!)])),
    tap(async ([order, orderArticles]) => {
      this.orderFormGroup.setValue({
        starts: order.starts.toISOString(),
        ends: order.ends?.toISOString(),
      });

      for (const orderArticle of orderArticles) {
        await orderArticle.save();
      }
    }),
    map(([order, orderArticles]) => ({ order, orderArticles }))
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
