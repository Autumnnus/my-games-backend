const asyncErrorWrapper = require("express-async-handler");
const {
  paginationHelper,
  searchHelper,
  productSortHelper
} = require("./queryHelpers");

const userQueryMiddleware = function (model) {
  return asyncErrorWrapper(async function (req, res, next) {
    let query = model.find();

    query = searchHelper("name", query, req);
    //*Pagination
    const total = await model.countDocuments();
    const paginationResult = await paginationHelper(total, query, req);
    query = paginationResult.query;
    //* Sort
    query = productSortHelper(query, req);
    const pagination = paginationResult.pagination;

    const queryResults = await query;
    res.queryResults = {
      success: true,
      count: queryResults.length,
      pagination: pagination,
      data: queryResults
    };
    next();
  });
};

module.exports = userQueryMiddleware;
