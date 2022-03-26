export interface FindAllParameters {
  where?: { [key: string]: any };
  paginate: { page: number; limit: number };
  sort: string;
  asc?: number;
}
