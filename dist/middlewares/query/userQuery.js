"use strict";
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextFunction, Request, Response } from "express";
// import asyncErrorWrapper from "express-async-handler";
// import {
//   paginationHelper,
//   productSortHelper,
//   searchHelper
// } from "./queryHelpers";
// interface CustomResponse extends Response {
//   queryResults?: {
//     success: boolean;
//     count: number;
//     pagination: any;
//     data: any[];
//   };
// }
// const userQueryMiddleware = function (model: any) {
//   return asyncErrorWrapper(async function (
//     req: Request,
//     res: CustomResponse,
//     next: NextFunction
//   ) {
//     let query = model.find();
//     query = searchHelper("name", query, req);
//     //*Pagination
//     const total = await model.countDocuments();
//     const paginationResult = await paginationHelper(total, query, req);
//     query = paginationResult.query;
//     //* Sort
//     query = productSortHelper(query, req);
//     const pagination = paginationResult.pagination;
//     const queryResults = await query;
//     res.queryResults = {
//       success: true,
//       count: queryResults.length,
//       pagination: pagination,
//       data: queryResults
//     };
//     next();
//   });
// };
// export default userQueryMiddleware;
