import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { switchMap, shareReplay, takeUntil, take } from 'rxjs/operators';
import { OrderRepetitionSetting } from 'src/app/models/orm/order-repetition-setting';
import { Supplier } from 'src/app/models/orm/supplier';
import { OrderRepetitionSettingsApiService } from 'src/app/services/api/order-repetition-settings-api.service';
import { LoaderService } from 'src/app/services/loader.service';
import ValidationUtil from 'src/app/utils/misc/validation-util';

const DEFAULT_FREQUENCY = 7;
const DEFAULT_PICKUP_OFFSET = 3;

@Component({
  selector: 'app-order-repetition-setting-form',
  templateUrl: './order-repetition-setting-form.page.html',
  styleUrls: ['./order-repetition-setting-form.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderRepetitionSettingFormPage implements OnDestroy {
  public readonly supplier$ = this.activatedRoute.paramMap.pipe(
    switchMap(params => this.getSupplierForParams(params)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public formGroup =  this.formBuilder.group({
    active: [undefined, Validators.required],
    startsAt: [undefined, Validators.required],
    frequency: [undefined, Validators.required],
    pickupOffset: [undefined, Validators.required],
  });

  private destroy$ = new Subject<void>();


  public constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly orderRepetitionSettingsApiService: OrderRepetitionSettingsApiService,
    private readonly loaderService: LoaderService,
  ) {
    this.supplier$.pipe(takeUntil(this.destroy$)).subscribe(supplier => {
      this.formGroup.setValue({
        active: supplier?.orderRepetitionSettingId !== undefined,
        startsAt: (supplier?.orderRepetitionSetting?.startsAt ?? new Date()).toISOString(),
        frequency: supplier?.orderRepetitionSetting?.frequency ?? DEFAULT_FREQUENCY,
        pickupOffset: supplier?.orderRepetitionSetting?.pickupOffset ?? DEFAULT_PICKUP_OFFSET,
      });

      if (supplier?.orderRepetitionSettingId === undefined) {
        this.formGroup.controls.active.addValidators(Validators.requiredTrue);
      } else {
        this.formGroup.controls.active.removeValidators(Validators.requiredTrue);
      }
    });

    this.formGroup.controls.active.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(active => {
      if (active) {
        this.formGroup.controls.startsAt.enable();
        this.formGroup.controls.frequency.enable();
        this.formGroup.controls.pickupOffset.enable();
      } else {
        this.formGroup.controls.startsAt.disable();
        this.formGroup.controls.frequency.disable();
        this.formGroup.controls.pickupOffset.disable();
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  public async close(): Promise<void> {
    await this.router.navigate(['../../orders'], { relativeTo: this.activatedRoute });
  }

  public async onSubmit(): Promise<void> {
    const loader = await this.loaderService.present();
    try {
      const supplier = (await this.supplier$.pipe(take(1)).toPromise())!;
      if (this.formGroup.controls.active.value) {
        await this.configure(supplier);
      } else {
        await this.orderRepetitionSettingsApiService.disable(supplier);
      }
      await this.close();
    } catch (e) {
      ValidationUtil.setFormErrors(this.formGroup, e);
    } finally {
      await loader.dismiss();
    }
  }

  private async configure(supplier: Supplier): Promise<void> {
    const setting = new OrderRepetitionSetting();
    setting.startsAt = this.formGroup.controls.startsAt.value;
    setting.frequency = this.formGroup.controls.frequency.value;
    setting.pickupOffset = this.formGroup.controls.pickupOffset.value;
    await this.orderRepetitionSettingsApiService.configure(supplier, setting);
  }


  private getSupplierForParams(params: ParamMap): Observable<Supplier | undefined> {
    const supplierId = params.get('id');
    if (supplierId === null) {
      throw new Error('supplier id is required');
    }

    return Supplier.findBy$('id', supplierId, Supplier.orderRepititionSettingsInclude);
  }
}


