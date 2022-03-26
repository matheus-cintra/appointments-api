export function paginateResponse(data: any[], page: number, limit: number) {
  const [total, result] = data;
  const lastPage = Math.ceil(total / limit); // 2 ok
  const nextPage = page >= lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;

  return {
    data: result,
    count: total,
    currentPage: page,
    nextPage,
    prevPage,
    lastPage,
  };
}
