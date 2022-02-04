import { ComponentFactoryResolver, ComponentRef, Directive, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ValidationErrorsComponent } from '../components/validation-errors/validation-errors.component';

@Directive({ selector: '[appValidationErrorsDisplay]' })
export class ValidationErrorsDisplayDirective implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private validationErrorsComponentRef?: ComponentRef<ValidationErrorsComponent>;

  public constructor(private readonly ngControl: NgControl, private target: ViewContainerRef, private readonly componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngOnInit(): void {
    this.ngControl.statusChanges?.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(status => {
      if (status === 'INVALID' && (this.ngControl.dirty || this.ngControl.touched) && this.ngControl.errors?.serverValidation !== undefined) {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ValidationErrorsComponent);
        this.validationErrorsComponentRef = this.target.createComponent(factory);
        this.validationErrorsComponentRef.instance.errorMessage = this.ngControl.errors?.serverValidation;
        this.validationErrorsComponentRef.changeDetectorRef.detectChanges();
      } else if (this.validationErrorsComponentRef !== undefined) {
        this.validationErrorsComponentRef.destroy();
        this.validationErrorsComponentRef = undefined;
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
