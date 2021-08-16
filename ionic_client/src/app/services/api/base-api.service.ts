import { HttpClient } from '@angular/common/http';
import { AppModel } from 'src/app/utils/orm';
import { ColumnType } from 'src/app/utils/orm/app-model';
import { SettingsService } from '../settings.service';
import { ApiPaginationResult } from './interfaces/api-pagination-result';
import { PaginationQuery, paginationQueryToHttpParams } from './interfaces/pagination-query';

export abstract class BaseApiService<ModelType extends AppModel> {
  protected readonly baseUrl = `${this.settingsService.getBaseUrl()}/ruebezahl17/api/v1`;

  protected readonly abstract modelName: string;

  public constructor(protected modelType: (new () => ModelType) & typeof AppModel, protected readonly httpClient: HttpClient, protected readonly settingsService: SettingsService) {}

  public async paginate(paginationQuery?: PaginationQuery<ModelType>): Promise<ApiPaginationResult<ModelType>> {
    const params = paginationQueryToHttpParams(paginationQuery);
    const response = <PaginationServerResponse> await this.httpClient.get(this.modelUrl, { params }).toPromise();

    const marshalledModels = <Partial<ModelType>[]> response[this.modelName];
    return {
      results: marshalledModels.map(marshalledModel => this.unmarshal(marshalledModel)),
      page: response.meta.page,
      perPage: response.meta.per_page,
      totalPages: response.meta.total_pages,
      totalCount: response.meta.total_count,
    };
  }

  protected get modelUrl(): string {
    return `${this.baseUrl}/${this.modelName}`;
  }

  protected unmarshal(modelData: Partial<ModelType>): ModelType {
    const model = new this.modelType();
    // eslint-disable-next-line prefer-destructuring
    for (const key of Object.keys(modelData)) {
      const value = modelData[<keyof ModelType> key];
      switch (this.modelType.typeMap[key]) {
        case ColumnType.date:
          (<Date | undefined> <unknown> model[<keyof ModelType> key]) = value ? new Date(<string> <unknown> value) : undefined;
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (<any> model[<keyof ModelType> key]) = value;
          break;
      }
    }
    return model;
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
