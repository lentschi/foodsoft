import { ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Setting } from 'src/app/models/setting';
import { LoginService, PermissionDenied } from 'src/app/services/login.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit, OnDestroy {
  @Input()
  public initialError?: Error;

  public loginFormGroup = this.formBuilder.group({
    userName: ['', Validators.required],
    password: [''],
  });

  private readonly destroy$ = new Subject<void>();


  public constructor(private readonly formBuilder: FormBuilder, private readonly modalController: ModalController, private readonly loginService: LoginService) {
  }

  public ngOnInit(): void {
    const userName = Setting.cached('userName', true);
    const password = Setting.cached('password', true);
    if (userName !== undefined && password !== undefined) {
      this.loginFormGroup.controls.userName.setValue(userName);
      this.loginFormGroup.controls.password.setValue(password);
    }

    this.loginFormGroup.valueChanges.pipe(take(1), takeUntil(this.destroy$)).subscribe(() => {
      this.initialError = undefined;
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }


  public async onSubmit(): Promise<void> {
    this.loginFormGroup.disable();

    let accessToken: string;
    try {
      accessToken = await this.loginService.login(this.loginFormGroup.value.userName, this.loginFormGroup.value.password);
    } catch (e) {
      this.loginFormGroup.enable();
      if (e instanceof PermissionDenied) {
        this.loginFormGroup.setErrors({ loginFailed: true });
      }
      return;
    }

    this.modalController.dismiss({ accessToken });
  }

  public get formValidExceptForLoginFailure(): boolean {
    if (this.loginFormGroup.valid) {
      return true;
    }

    const errorKeys = this.loginFormGroup.errors ? Object.keys(this.loginFormGroup.errors) : [];
    const controls = Object.values(this.loginFormGroup.controls);
    return !errorKeys.some(errorKey => errorKey !== 'loginFailed') &&
      !controls.some(control => control.invalid);
  }

  public get loginFailed(): boolean {
    if (this.initialError instanceof PermissionDenied) {
      return true;
    }

    return this.loginFormGroup.errors?.loginFailed;
  }
}
