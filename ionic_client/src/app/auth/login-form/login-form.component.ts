import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import * as ClientOAuth2 from 'client-oauth2';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {

  loginFormGroup = this.formBuilder.group({
    userName: [''],
    password: ['']
  });

  private readonly auth = new ClientOAuth2({
    clientId: 'RhGguyvsjQOADrGiAix9Ds6uh2vjsHfUJFzWExuEw_Y',
    clientSecret: 'eMIeiaeMNnwHnFIfsg0SA_sgeIpBzG6vqI7-qpZydg8',
    accessTokenUri: 'http://localhost:3000/ruebezahl17/oauth/token',
    authorizationUri: 'http://localhost:3000/ruebezahl17/oauth/authorize',
    redirectUri: 'http://localhost:8100/home'
  });

  constructor(private readonly formBuilder: FormBuilder, private readonly modalController: ModalController) {
  }

  ngOnInit() {
  }

  async onSubmit(): Promise<void> {
    let accessToken: string;
    try {
      const token = await this.auth.owner.getToken(this.loginFormGroup.value.userName, this.loginFormGroup.value.password);
      accessToken = token.accessToken;
    } catch(e) {
      console.log('TODO handle', e);
      return;
    }

    this.modalController.dismiss({accessToken})
  }

}
