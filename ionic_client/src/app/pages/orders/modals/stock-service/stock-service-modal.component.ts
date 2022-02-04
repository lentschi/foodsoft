import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Order } from 'src/app/models/orm/order';
import { Setting } from 'src/app/models/orm/setting';
import { User } from 'src/app/models/orm/user';
import { StockServicesApiService } from 'src/app/services/api/stock-services-api.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  templateUrl: './stock-service-modal.component.html',
  styleUrls: ['./stock-service-modal.component.scss'],
})
export class StockServiceModalComponent {
  private  currentUserId$ = Setting.cached$('userId');

  private orderId$ = new BehaviorSubject<string | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly order$ = this.orderId$.pipe(switchMap(orderId => {
    if (orderId === undefined) {
      return of(undefined);
    }

    return Order.findBy$('id', orderId, Order.taskInclude);
  }));

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public currentUserAssignedAsResponsibleUser$ = combineLatest([this.order$, this.currentUserId$])
    .pipe(map(([order, currentUserId]) => order?.task?.responsibleUserId === currentUserId));

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public currentUserAssigned$ = combineLatest([this.order$, this.currentUserId$])
    .pipe(map(([order, currentUserId]) => order?.task?.users.some(user => user.id === currentUserId)));

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public responsibleUser$ = this.order$
    .pipe(map(order => order?.task?.responsibleUser));

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public helpers$ = this.order$
    .pipe(
      map(order => order?.task?.users.filter(user => user.id !== order.task?.responsibleUserId)),
      map(helpers => helpers === undefined || helpers.length === 0 ? undefined : helpers)
    );

  @Input()
  public set order(order: Order | undefined) {
    this.orderId$.next(order?.id);
  }


  public constructor(private readonly modalCtrl: ModalController, private readonly stockServicesApiService: StockServicesApiService, private readonly loaderService: LoaderService) {}

  public close(): void {
    void this.modalCtrl.dismiss();
  }

  public isCurrentUser$(user: User): Observable<boolean> {
    return this.currentUserId$.pipe(map(currentUserId => user.id === currentUserId));
  }

  public async signUp(asResponsibleUser = true): Promise<void> {
    const loader = await this.loaderService.present();
    const order = await this.order$.pipe(take(1)).toPromise();
    await this.stockServicesApiService.signUp(order!, asResponsibleUser);
    await loader.dismiss();
  }

  public async unsubscribeIfCurrentUser(user: User): Promise<void> {
    if (Setting.cached('userId') !== user.id) {
      return;
    }

    await this.unsubscribe(user);
  }

  public async unsubscribe(user: User): Promise<void> {
    const loader = await this.loaderService.present();
    const order = await this.order$.pipe(take(1)).toPromise();
    void this.stockServicesApiService.unsubscribe(order!.serverId);
    await loader.dismiss();
  }
}
