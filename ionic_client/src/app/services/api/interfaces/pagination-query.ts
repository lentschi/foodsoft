import { HttpParams } from '@angular/common/http';
import { AppModel } from 'src/app/utils/orm';

export interface PaginationQuery<ModelType extends AppModel> {
  orderBy?: keyof ModelType;
  orderDirection?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export const paginationQueryToHttpParams = <ModelType extends AppModel>(paginationQuery?: PaginationQuery<ModelType>): HttpParams => {
  let params: HttpParams = new HttpParams();

  if (!paginationQuery) {
    return params;
  }

  if (paginationQuery.orderBy !== undefined) {
    params = params.set('order', <string> paginationQuery.orderBy);
  }
  if (paginationQuery.orderDirection) {
    params = params.set('order_direction', paginationQuery.orderDirection);
  }
  if (paginationQuery.page !== undefined) {
    params = params.set('page', paginationQuery.page.toString());
  }
  if (paginationQuery.perPage !== undefined) {
    params = params.set('per_page', paginationQuery.perPage.toString());
  }

  return params;
};
