import { HttpClient } from '@angular/common/http';
import snakeCase  from 'lodash-es/snakeCase';
import { AppModel } from 'src/app/utils/orm';
import { SettingsService } from '../settings.service';
import { ApiPaginationResult } from './interfaces/api-pagination-result';
import { PaginationQuery, paginationQueryToHttpParams } from './interfaces/pagination-query';

export abstract class BaseApiService<ModelType extends AppModel> {
  protected readonly baseUrl = `${this.settingsService.getBaseUrl()}/ruebezahl17/api/v1`;

  protected readonly abstract modelName: string;

  public constructor(protected modelType: (new () => ModelType) & typeof AppModel, protected readonly httpClient: HttpClient, protected readonly settingsService: SettingsService) {}

  public async show(id: number): Promise<ModelType> {
    const response = await this.httpClient.get(`${this.modelUrl}/${id}`).toPromise();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-extra-parens
    const data = <Partial<ModelType>> (<any> response)[snakeCase(this.modelType.tableName)];
    const model = this.modelType.unmarshalServerData(data);
    await model.save();
    await this.saveRelations(model);
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
      await this.saveRelations(result);
    }

    return paginationData;
  }

  protected async saveRelations(model: ModelType): Promise<void> {
    for (const hasOnePropertyName of Object.keys(this.modelType.hasOneRelations)) {
      const relatedModel = <AppModel | undefined> <unknown> model[<keyof ModelType> hasOnePropertyName.replace(/Id$/u, '')];
      await relatedModel?.save();
    }

    for (const hasManyPropertyName of Object.keys(this.modelType.hasManyRelations)) {
      const relatedModels = <AppModel[] | undefined> <unknown> model[<keyof ModelType> hasManyPropertyName];
      if (Array.isArray(relatedModels)) {
        for (const relatedModel of relatedModels) {
          await relatedModel.save();
        }
      }
    }
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
