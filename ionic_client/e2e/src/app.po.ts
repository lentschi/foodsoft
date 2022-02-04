import { browser, by, element, promise } from 'protractor';

export class AppPage {
  public navigateTo(): promise.Promise<unknown> {
    return browser.get('/');
  }

  public getParagraphText(): promise.Promise<string> {
    return element(by.deepCss('app-root ion-content')).getText();
  }
}
