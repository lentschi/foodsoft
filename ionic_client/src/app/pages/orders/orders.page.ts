import { ChangeDetectionStrategy,  Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, take, takeUntil } from 'rxjs/operators';
import { orderIdUpdated$ } from 'src/app/events';
import { Supplier } from 'src/app/models/orm/supplier';
import { SuppliersApiService } from 'src/app/services/api/suppliers-api.service';
import { QueryOperator } from 'src/app/utils/orm/operator-enum';
import { Order } from '../../models/orm/order';
import { OrdersApiService } from '../../services/api/orders-api.service';
import compareAsc from 'date-fns/compareAsc';
import GeneralUtil from 'src/app/utils/misc/general-util';
import { isEqual, last } from 'lodash-es';
import isBefore from 'date-fns/isBefore';
import { addDays, isAfter } from 'date-fns';
import differenceInDays from 'date-fns/differenceInDays';
import { OrderRepetitionSetting } from 'src/app/models/orm/order-repetition-setting';
import isSameDay from 'date-fns/isSameDay';
import max from 'date-fns/max';
import { OrderState } from 'src/app/models/enums/order-state';
import { OfflineModeError } from 'src/app/services/api/errors/offline-mode-error';

// TODO: Maybe calculate this by screen size somehow:
const NUMBER_OF_REPEATING_ORDERS_TO_ADD_ON_SCROLL = 30;

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.page.html',
  styleUrls: ['orders.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage implements OnInit, OnDestroy {
  @ViewChild('olderOrdersScroller', { static: false }) public olderOrdersScroller?: IonInfiniteScroll;

  @ViewChild('newerOrdersScroller', { static: false }) public newerOrdersScroller?: IonInfiniteScroll;

  @ViewChild('todayMarker', { static: false }) public todayMarker?: ElementRef<HTMLElement>;

  @ViewChild(IonContent) public content: IonContent;

  public readonly orders$ = new BehaviorSubject<Order[]>([]);

  public readonly ordersBeforeToday$ = this.orders$.pipe(map(orders => orders.filter(order => isBefore(order.ends ?? 0, new Date()))));

  public readonly ordersAfterToday$ = this.orders$.pipe(map(orders => orders.filter(order => isBefore(new Date(), order.ends ?? 0))));

  public readonly repeatedOrders$ = new BehaviorSubject<Order[]>([]);

  public readonly initialized$ = new BehaviorSubject<boolean>(false);

  public readonly focusedOrderId$ = orderIdUpdated$;

  private readonly suppliersWithRepeatingOrders$ = Supplier
    .all()
    .include(Supplier.orderRepititionSettingsInclude)
    .filter('orderRepetitionSettingId', QueryOperator.notEqual, undefined)
    .list$();

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly newerScrollerDisabled$ = this.suppliersWithRepeatingOrders$.pipe(map(suppliers => this.loadedLatestOrders && suppliers.length === 0));

  private currentLowerPage?: number;

  private currentUpperPage?: number;

  private totalPages?: number;

  private destroy$ = new Subject<void>();

  private repeatedOrdersUpperDate?: Date;

  public constructor(private readonly ordersApiService: OrdersApiService, private readonly suppliersApiService: SuppliersApiService) {}

  public async ngOnInit(): Promise<void> {
    this.setOrdersListFromDbAndRepeatedOrders();
    this.clearRepeatedOrdersOnChange();

    await this.reloadList();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  public async loadNewer(): Promise<void> {
    if (this.loadedLatestOrders) {
      await this.appendSomeRepeatedOrders();
    } else {
      this.currentUpperPage! += 1;
      await this.fetchOrders('new');
    }

    await this.newerOrdersScroller?.complete();
  }

  public async loadOlder(): Promise<void> {
    this.currentLowerPage! -= 1;
    await this.fetchOrders('old');

    await this.olderOrdersScroller?.complete();
  }

  public async reloadList(): Promise<void> {
    this.initialized$.next(false);
    try {
      await this.suppliersApiService.list();
      this.currentLowerPage =  await this.ordersApiService.getTodaysPage();
    } catch (e) {
      if (e instanceof OfflineModeError) {
        this.initialized$.next(true);
      }
      return;
    }
    this.currentUpperPage = this.currentLowerPage;
    await this.fetchOrders('new', true);


    // Load one additional older page to ensure infinite scrollers work properly:
    await this.loadOlder();

    this.initialized$.next(true);
  }

  public goToToday(): void {
    this.todayMarker?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  public get olderScrollerDisabled(): boolean {
    return this.currentLowerPage === undefined || this.currentLowerPage <= 1;
  }

  public get loadedLatestOrders(): boolean {
    return this.totalPages === undefined || this.currentUpperPage === undefined || this.currentUpperPage >= this.totalPages;
  }

  private populateRepeatedOrdersUpToDate(toDate: Date, suppliersWithRepeatingOrders: Supplier[]): void {
    for (const supplier of suppliersWithRepeatingOrders) {
      this.populateRepeatedOrdersForSupplier(toDate, supplier);
    }

    this.repeatedOrders$.next(this.repeatedOrders$.value);
    this.repeatedOrdersUpperDate = toDate;
  }

  private populateRepeatedOrdersForSupplier(toDate: Date, supplier: Supplier): void {
    const repeatedOrders = this.repeatedOrders$.value;
    const orderRepetitionSetting = supplier.orderRepetitionSetting!;

    const fromDate = max([orderRepetitionSetting.startsAt, this.repeatedOrdersUpperDate ?? 0]);
    for (let currentDate = fromDate; isBefore(currentDate, toDate); currentDate = addDays(currentDate, 1)) {
      if (this.repeatedOrderRequiredForDate(currentDate, orderRepetitionSetting, supplier)) {
        repeatedOrders.push(createRepeatedOrder(currentDate, orderRepetitionSetting, supplier));
      }
    }
  }

  private repeatedOrderRequiredForDate(currentDate: Date, orderRepetitionSetting: OrderRepetitionSetting, supplier: Supplier): boolean {
    return orderShouldBeRepeatedAtDate(orderRepetitionSetting, currentDate) &&

      // no *actual* order with that supplier exists for `currentDate`:
      !this.orders$.value.some(order => order.supplierId === supplier.id && isSameDay(order.ends ?? 0, currentDate));
  }

  private async appendSomeRepeatedOrders(): Promise<void> {
    const suppliersWithRepeatingOrders = await this.suppliersWithRepeatingOrders$.pipe(take(1)).toPromise();
    if (suppliersWithRepeatingOrders.length === 0) {
      // no repeating orders available
      return;
    }

    const amountBefore = this.repeatedOrders$.value.length;
    if (!this.repeatedOrdersUpperDate) {
      console.log('Loading repeated orders due to endless scroller after loading all db orders');
      await this.populateRepeatedOrdersUpToLastFetchedOrder();
    }

    while (this.repeatedOrders$.value.length - amountBefore < NUMBER_OF_REPEATING_ORDERS_TO_ADD_ON_SCROLL) {
      if (!this.repeatedOrdersUpperDate) {
        throw new Error('repeatedOrdersUpperDate may not be null on append');
      }

      const toDate = addDays(this.repeatedOrdersUpperDate, 1);
      this.populateRepeatedOrdersUpToDate(toDate, suppliersWithRepeatingOrders);
    }
  }

  private async fetchOrders(direction: 'old' | 'new', clearDb = false): Promise<void> {
    const ordersResult = await this.ordersApiService.paginate({ orderBy: 'ends', orderDirection: 'asc', page: direction === 'old' ? this.currentLowerPage : this.currentUpperPage }, clearDb);

    // Ensure results have arrived in the DB:
    await this.orders$.pipe(
      map(orders => ordersResult.results.every(orderResult => orders.some(order => order.id === orderResult.id))),
      filter(allLoaded => allLoaded),
      take(1),
      takeUntil(this.destroy$)
    ).toPromise();

    if (direction === 'new') {
      console.log('Loading repeated orders due to endless scroller loading orders from db');

      await this.populateRepeatedOrdersUpToLastFetchedOrder();
    }

    this.totalPages = ordersResult.totalPages;
  }

  private async populateRepeatedOrdersUpToLastFetchedOrder(): Promise<void> {
    this.clearRepeatedOrders();

    const orderEndDates = this.orders$.value
      .map(order => order.ends)
      .filter(GeneralUtil.notEmpty);
    const lastOrderEnds = last(orderEndDates);

    if (lastOrderEnds) {
      const suppliersWithRepeatingOrders = await this.suppliersWithRepeatingOrders$.pipe(take(1)).toPromise();
      this.populateRepeatedOrdersUpToDate(lastOrderEnds, suppliersWithRepeatingOrders);
    }
  }

  private setOrdersListFromDbAndRepeatedOrders(): void {
    combineLatest([
      Order
        .all()
        .include(Order.taskInclude)
        .order(<keyof Order> 'ends')
        .list$(),
      this.repeatedOrders$,
    ])
      .pipe(
        map(([orders, repeatedOrders]) => [...orders, ...repeatedOrders].sort((a, b) => compareAsc(a.ends ?? 0, b.ends ?? 0))),
        takeUntil(this.destroy$)
      )
      .subscribe(orders => this.setOrdersWithoutCreatingNewArrayInstance(orders));
  }

  private setOrdersWithoutCreatingNewArrayInstance(orders: Order[]): void {
    this.orders$.value.splice(0, this.orders$.value.length, ...orders);
    this.orders$.next(this.orders$.value);
  }

  private clearRepeatedOrdersOnChange(): void {
    OrderRepetitionSetting.all().list$()
      .pipe(
        distinctUntilChanged(isEqual),
        filter(() => this.orders$.value.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe(async () => {
        await this.populateRepeatedOrdersUpToLastFetchedOrder();

        await this.appendSomeRepeatedOrders();
      });

    Order
      .all()
      .list$()
      .pipe(
        filter(orders => orders
          .some(order => this.repeatedOrders$.value
            .some(repeatedOrder => repeatedOrder.supplierId === order.supplierId && repeatedOrder.ends && order.ends && isSameDay(repeatedOrder.ends, order.ends)))),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('orders changed');
        this.clearRepeatedOrders();
      });
  }

  private clearRepeatedOrders(): void {
    this.repeatedOrdersUpperDate = undefined;
    this.repeatedOrders$.next([]);
  }
}

const createRepeatedOrder = (currentDate: Date, orderRepetitionSetting: OrderRepetitionSetting, supplier: Supplier): Order => {
  const repeatedOrder = new Order();
  repeatedOrder.name = supplier.name;
  repeatedOrder.supplier = supplier;
  repeatedOrder.supplierId = supplier.id;
  repeatedOrder.ends = currentDate;
  repeatedOrder.starts = addDays(repeatedOrder.ends, -7); // TODO: Make this another OrderRepetitionSetting attribute `startsOffset`
  repeatedOrder.pickup = addDays(repeatedOrder.ends, orderRepetitionSetting.pickupOffset);
  repeatedOrder.state = OrderState.planned;

  return repeatedOrder;
};

const orderShouldBeRepeatedAtDate = (orderRepetitionSetting: OrderRepetitionSetting, currentDate: Date): boolean => differenceInDays(orderRepetitionSetting.startsAt, currentDate) % orderRepetitionSetting.frequency === 0;
