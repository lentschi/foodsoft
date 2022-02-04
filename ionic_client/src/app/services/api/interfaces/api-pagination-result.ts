import { AppModel } from 'src/app/utils/orm';

export interface ApiPaginationResult<ModelType extends AppModel> {
  results: ModelType[];
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
}
