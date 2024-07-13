type Query = {
  populate(population: string): Query;
  sort(sortKey: string): Query;
  where(searchObject: any): Query;
  skip(startIndex: number): Query;
  limit(limit: number): Query;
};

type Request = {
  query: {
    search?: string;
    sortBy?: string;
    page?: string;
    limit?: string;
  };
};

const searchHelper = (searchKey: string, query: any, req: any): any => {
  if (req.query.search) {
    const searchObject: any = {};

    const regex = new RegExp(req.query.search, "i"); //*https://javascript.info/regexp-introduction
    searchObject[searchKey] = regex;

    return (query = query.where(searchObject));
  }
  return query;
};

const populateHelper = (query: Query, population: string): Query => {
  return query.populate(population);
};
const questionSortHelper = (query: Query, req: Request) => {
  const sortKey = req.query.sortBy;
  if (sortKey === "most-answered") {
    return query.sort("-answerCount -createAt");
  }
  if (sortKey === "most-liked") {
    return query.sort("-likeCount -createAt");
  }
  return query.sort("-createAt");
};
const paginationHelper = async (
  totalDocuments: number,
  query: Query,
  req: Request
) => {
  const page = parseInt(req.query.page ?? "1");
  const limit = parseInt(req.query.limit ?? "5");

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const pagination: { previous?: any; next?: any } = {};
  const total = totalDocuments;

  if (startIndex > 0) {
    pagination.previous = {
      page: page - 1,
      limit: limit
    };
  }
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit
    };
  }
  return {
    query:
      query === undefined ? undefined : query.skip(startIndex).limit(limit),
    pagination: pagination,
    startIndex,
    limit
  };
};

const productSortHelper = (query: Query, req: Request) => {
  const sortKey = req.query.sortBy;
  if (sortKey) {
    return query.sort(sortKey);
  }
  return query.sort("-createdAt");
};

export {
  paginationHelper,
  populateHelper,
  productSortHelper,
  questionSortHelper,
  searchHelper
};
