import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';
import { Order } from '../models/order';
import { OrdersApiService } from '../services/api/orders-api.service';

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.page.html',
  styleUrls: ['orders.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage implements OnInit, AfterViewChecked {
  // @ViewChild(IonVirtualScroll) public virtualScroll: IonVirtualScroll;

  @ViewChild('olderOrdersScroller', { static: false }) public olderOrdersScroller?: IonInfiniteScroll;

  @ViewChild('newerOrdersScroller', { static: false }) public newerOrdersScroller?: IonInfiniteScroll;

  @ViewChild(IonContent) public content: IonContent;

  public orders: Order[] = [];

  private currentLowerPage = 0;

  private currentUpperPage = 0;

  private totalPages?: number;

  public constructor(private ordersApiService: OrdersApiService, private cd: ChangeDetectorRef) {}

  public async ngOnInit(): Promise<void> {
    this.currentLowerPage =  await this.ordersApiService.getTodaysPage();
    this.currentUpperPage = this.currentLowerPage;
    const ordersResult = await this.ordersApiService.paginate({ orderBy: 'ends', orderDirection: 'asc', page: this.currentLowerPage });
    this.totalPages = ordersResult.totalPages;

    // const user = new User();
    // user.name = 'Flo';
    // await user.save();
    // const collection = User.all();
    // const single = await collection.list();
    // const single = await User.all().filter('id', QueryOperator.equal, 'e014e950-f69c-11eb-9768-39e4ab00da53')
    //   .one();
    console.log('resp', ordersResult);
    this.orders = ordersResult.results;
    this.cd.markForCheck();
  }

  public async ngAfterViewChecked(): Promise<void> {
    // if (this.scrollToBottomAfterViewChecked) {

    //   this.scrollToBottomAfterViewChecked = false;
    // }
  }

  public async loadNewer(): Promise<void> {
    this.currentUpperPage += 1;
    const ordersResult = await this.ordersApiService.paginate({ orderBy: 'ends', orderDirection: 'asc', page: this.currentUpperPage });
    this.orders.push(...ordersResult.results);

    // this.orders$.next(orders);

    await this.newerOrdersScroller?.complete();
    this.cd.markForCheck();

    // this.virtualScroll.checkEnd();
  }

  public async loadOlder(): Promise<void> {
    this.currentLowerPage -= 1;
    const ordersResult = await this.ordersApiService.paginate({ orderBy: 'ends', orderDirection: 'asc', page: this.currentLowerPage });
    this.orders.unshift(...ordersResult.results);

    // this.orders$.next(orders);

    await this.olderOrdersScroller?.complete();
    this.cd.markForCheck();

    // this.virtualScroll.checkRange(0, 20);

    // setTimeout(() => {
    //   void this.content.scrollToPoint(undefined, 200);
    // }, 100);
  }

  public get olderScrollerDisabled(): boolean {
    return this.currentLowerPage === 0;
  }

  public get newerScrollerDisabled(): boolean {
    return this.currentUpperPage === this.totalPages;
  }
}
