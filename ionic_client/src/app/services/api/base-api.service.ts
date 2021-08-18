import { HttpClient } from '@angular/common/http';
import { AppModel } from 'src/app/utils/orm';
import { SettingsService } from '../settings.service';
import { ApiPaginationResult } from './interfaces/api-pagination-result';
import { PaginationQuery, paginationQueryToHttpParams } from './interfaces/pagination-query';

export abstract class BaseApiService<ModelType extends AppModel> {
  protected readonly baseUrl = `${this.settingsService.getBaseUrl()}/ruebezahl17/api/v1`;

  protected readonly abstract modelName: string;

  public constructor(protected modelType: (new () => ModelType) & typeof AppModel, protected readonly httpClient: HttpClient, protected readonly settingsService: SettingsService) {}

  public async show(id: number): Promise<ModelType> {
    const response = <Partial<ModelType>> await this.httpClient.get(`${this.modelUrl}/${id}`).toPromise();
    const model = this.modelType.unmarshalServerData(response);
    await model.save();
    return model;
  }

  public async paginate(paginationQuery?: PaginationQuery<ModelType>, overwriteDbOnSuccess = false): Promise<ApiPaginationResult<ModelType>> {
    const params = paginationQueryToHttpParams(paginationQuery);
    const response = <PaginationServerResponse> await this.httpClient.get(this.modelUrl, { params }).toPromise();

    const marshalledModels = <Partial<ModelType>[]> response[this.modelName];
    const paginationData = {
      results: marshalledModels.map(marshalledModel => this.modelType.unmarshalServerData(marshalledModel)),
      page: response.meta.page,
      perPage: response.meta.per_page,
      totalPages: response.meta.total_pages,
      totalCount: response.meta.total_count,
    };

    if (overwriteDbOnSuccess) {
      await this.modelType.all().delete();
    }

    for (const result of paginationData.results) {
      await result.save();
      for (const hasOnePropertyName of Object.keys(this.modelType.hasOneRelations)) {
        const relatedModel = <AppModel> <unknown> result[<keyof ModelType> hasOnePropertyName.replace(/Id$/u, '')];
        await relatedModel.save();
      }
    }

    return paginationData;
  }

  protected get modelUrl(): string {
    return `${this.baseUrl}/${this.modelName}`;
  }
}

interface PaginationServerResponse {
  [x: string]: unknown;

  meta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}
