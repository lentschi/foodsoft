import { AppModel } from 'src/app/utils/orm';

export interface PaginationQuery<ModelType extends AppModel> {
  orderBy?: keyof ModelType;
  orderDirection?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}
