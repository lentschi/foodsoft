import { ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import * as ClientOAuth2 from 'client-oauth2';

@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  public loginFormGroup = this.formBuilder.group({
    userName: ['', Validators.required],
    password: [''],
  });

  private readonly auth = new ClientOAuth2({
    clientId: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
    clientSecret: 'eMIeiaeMNnwHnFIfsg0SA_sgeIpBzG6vqI7-qpZydg8',
    accessTokenUri: 'http://localhost:3000/ruebezahl17/oauth/token',
    authorizationUri: 'http://localhost:3000/ruebezahl17/oauth/authorize',
    redirectUri: 'http://localhost:8100/home',
  });

  public constructor(private readonly formBuilder: FormBuilder, private readonly modalController: ModalController) {}

  public async onSubmit(): Promise<void> {
    this.loginFormGroup.disable();

    let accessToken: string;
    try {
      const token = await this.auth.owner.getToken(this.loginFormGroup.value.userName, this.loginFormGroup.value.password);
      ({ accessToken } = token);
    } catch (e) {
      this.loginFormGroup.enable();
      if (e.body?.error === 'invalid_grant') {
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
}
