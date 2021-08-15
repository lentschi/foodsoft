import { HttpClient, HttpParams } from '@angular/common/http';
import { AppModel } from 'src/app/utils/orm';
import { ApiPaginationResult } from './interfaces/api-pagination-result';

export abstract class BaseApiService<ModelType extends AppModel> {
  protected readonly baseUrl = 'http://localhost:3000/ruebezahl17/api/v1';

  protected readonly abstract modelName: string;

  public constructor(protected modelType: (new () => ModelType) & typeof AppModel, protected readonly httpClient: HttpClient) {}

  public async paginate(order?: {by: keyof ModelType; orderDirection?: 'asc' | 'desc';}): Promise<ApiPaginationResult<ModelType>> {
    let params: HttpParams = new HttpParams();
    if (order) {
      params = params.set('order', <string> order.by);
      if (order.orderDirection) {
        params = params.set('order_direction', order.orderDirection);
      }
    }
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
    for (const key of Object.keys(modelData)) {
      const value = modelData[<keyof ModelType> key];
      switch (this.modelType.typeMap[key]) {
        case 'DATE': (<Date> <unknown> model[<keyof ModelType> key]) = new Date(<string> <unknown> value); break;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (<any> model[<keyof ModelType> key]) = value; break;
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
