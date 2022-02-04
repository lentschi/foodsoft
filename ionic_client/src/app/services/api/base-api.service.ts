import { HttpClient } from '@angular/common/http';
import snakeCase  from 'lodash-es/snakeCase';
import { AppModel } from 'src/app/utils/orm';
import { SettingsService } from '../settings.service';
import { ApiPaginationResult } from './interfaces/api-pagination-result';
import { PaginationQuery, paginationQueryToHttpParams } from './interfaces/pagination-query';

export abstract class BaseApiService<ModelType extends AppModel> {
  protected readonly abstract modelName: string;

  public constructor(protected modelType: (new () => ModelType) & typeof AppModel, protected readonly httpClient: HttpClient, protected readonly settingsService: SettingsService) {}

  public async get(id: number): Promise<ModelType> {
    const response = await this.httpClient.get(`${this.modelUrl}/${id}`).toPromise();
    const data = this.extractModelDataFromServerResponse(response);
    const model = this.modelType.unmarshalServerData(data);
    await model.save();
    await this.saveRelationsReturnedFromServer(model);
    return model;
  }

  public async list(overwriteDbOnSuccess = true): Promise<ModelType[]> {
    const response = await this.httpClient.get(this.modelUrl).toPromise();
    const marshalledModels = this.extractModelIndexDataFromServerResponse(response);
    const results =  marshalledModels.map(marshalledModel => this.modelType.unmarshalServerData(marshalledModel));

    if (overwriteDbOnSuccess) {
      await this.modelType.all().delete();
    }

    for (const result of results) {
      await result.save();
      await this.saveRelationsReturnedFromServer(result);
    }

    return results;
  }

  public async paginate(paginationQuery?: PaginationQuery<ModelType>, overwriteDbOnSuccess = false): Promise<ApiPaginationResult<ModelType>> {
    const params = paginationQueryToHttpParams(paginationQuery);
    const response = <PaginationServerResponse> await this.httpClient.get(this.modelUrl, { params }).toPromise();

    const marshalledModels = this.extractModelIndexDataFromServerResponse(response);
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
      await this.saveRelationsReturnedFromServer(result);
    }

    return paginationData;
  }

  public async save(model: ModelType, data: unknown): Promise<ModelType> {
    const returnedModel = await this.putOrPost(model, data);
    await returnedModel.save();
    await this.saveRelationsReturnedFromServer(returnedModel);
    return returnedModel;
  }

  public async delete(model: ModelType): Promise<void> {
    await this.httpClient.delete(`${this.modelUrl}/${model.serverId}`).toPromise();
    await model.delete();
  }

  protected async putOrPost(model: ModelType, data: unknown): Promise<ModelType> {
    let response: unknown;
    let modelId: number;
    try {
      modelId = model.serverId;
    } catch (e) {
      response = await this.httpClient.post(this.modelUrl, data).toPromise();
      const returnData = this.extractModelDataFromServerResponse(response);
      return this.modelType.unmarshalServerData(returnData);
    }

    response = await this.httpClient.put(`${this.modelUrl}/${modelId}`, data).toPromise();
    const returnData = this.extractModelDataFromServerResponse(response);
    return this.modelType.unmarshalServerData(returnData);
  }

  protected async saveRelationsReturnedFromServer(model: AppModel, modelType: typeof AppModel = this.modelType): Promise<void> {
    for (const hasOnePropertyName of Object.keys(modelType.hasOneRelations)) {
      const relatedModel = <AppModel | undefined> <unknown> model[<keyof AppModel> hasOnePropertyName.replace(/Id$/u, '')];
      if (relatedModel !== undefined) {
        await relatedModel.save();
        await this.saveRelationsReturnedFromServer(relatedModel, <typeof AppModel> relatedModel.constructor);
      }
    }

    for (const hasManyPropertyName of Object.keys(modelType.hasManyRelations)) {
      const relatedModels = <AppModel[] | undefined> <unknown> model[<keyof AppModel> hasManyPropertyName];
      if (Array.isArray(relatedModels)) {
        for (const relatedModel of relatedModels) {
          await relatedModel.save();
          await this.saveRelationsReturnedFromServer(relatedModel, <typeof AppModel> relatedModel.constructor);
        }
      }
    }

    for (const [hasAndBelongsToManyPropertyName, relatedModelClassName] of Object.entries(modelType.hasAndBelongsToManyRelations)) {
      const relatedModels = <AppModel[] | undefined> <unknown> model[<keyof AppModel> hasAndBelongsToManyPropertyName];
      if (Array.isArray(relatedModels)) {
        const relatedModelClass = AppModel.getModelClass(relatedModelClassName);
        await model.removeAllHabtmRelations(relatedModelClass);
        for (const relatedModel of relatedModels) {
          await relatedModel.save();
          await model.addHabtmRelation(relatedModel);
          await this.saveRelationsReturnedFromServer(relatedModel, <typeof AppModel> relatedModel.constructor);
        }
      }
    }
  }

  protected extractModelDataFromServerResponse(response: unknown): Partial<ModelType> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-extra-parens
    return <Partial<ModelType>> (<any> response)[snakeCase(this.modelType.tableName)];
  }

  protected extractModelIndexDataFromServerResponse(response: unknown): Partial<ModelType>[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-extra-parens
    return <Partial<ModelType>[]> (<any> response)[this.modelName];
  }

  protected get modelUrl(): string {
    return `${this.baseUrl}/${this.modelName}`;
  }

  protected get baseUrl(): string {
    return `${this.settingsService.getBaseUrl()}/api/v1`;
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
