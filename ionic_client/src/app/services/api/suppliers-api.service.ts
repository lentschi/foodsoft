import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Article } from 'src/app/models/orm/article';
import { Order } from 'src/app/models/orm/order';
import { Supplier } from 'src/app/models/orm/supplier';
import { SettingsService } from '../settings.service';
import { BaseApiService } from './base-api.service';

@Injectable()
export class SuppliersApiService extends BaseApiService<Supplier> {
  protected readonly modelName = 'suppliers';

  public constructor(httpClient: HttpClient, settingsService: SettingsService) {
    super(Order, httpClient, settingsService);
  }

  public async getArticles(supplierId: number): Promise<Article[]> {
    let params = new HttpParams();
    params = params.set('per_page', '-1');
    const response = <{order_articles: Partial<Article>[];}> await this.httpClient.get(`${this.modelUrl}/${supplierId}/articles`, { params }).toPromise();
    const articles = response.order_articles.map(articleResponse => Article.unmarshalServerData(articleResponse));
    for (const article of articles) {
      await article.save();
    }
    return articles;
  }
}
