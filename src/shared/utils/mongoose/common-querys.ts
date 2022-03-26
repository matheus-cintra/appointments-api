import { Model } from 'mongoose';
import { paginateResponse } from '../pagination-response/pagination-response';
import { FindAllParameters } from '../types/find-all-parameters';

export const findAllWithPaginate = async (model: Model<any>, { paginate, sort, where, asc }: FindAllParameters) => {
  const result = await model
    .find({ ...where }, {}, { skip: (paginate.page - 1) * paginate.limit, limit: paginate.limit })
    .sort({ [sort]: asc || 1 });

  const count = await model.count({ ...where });

  return paginateResponse([count, result], paginate.page, paginate.limit);
};

export const findByConditionWithPaginate = async (
  model: Model<any>,
  { paginate, sort, asc }: FindAllParameters,
  options: any,
) => {
  const result = await model
    .find({ ...options }, {}, { skip: (paginate.page - 1) * paginate.limit, limit: paginate.limit })
    .sort({ [sort]: asc || 1 });

  const count = await model.count({ ...options });

  return paginateResponse([count, result], paginate.page, paginate.limit);
};
