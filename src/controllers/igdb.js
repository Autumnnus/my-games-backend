const asyncErrorWrapper = require("express-async-handler");
const CustomError = require("../helpers/errors/CustomError");

const getIGDBGames = asyncErrorWrapper(async (req, res, next) => {
  const { search } = req.query;
  fetch(
    `https://api.igdb.com/v4/games?search=${search}&fields=name,id,cover,rating,slug,summary,tags`,
    {
      method: "POST",
      headers: {
        "Client-ID": "l4pr55lt0ezaizlm7ug9sat0s5zorp",
        Authorization: `Bearer xtc36j138h3pk0wxl3z53r27a7rrxt`,
        "Content-Type": "application/json",
        Body: "fields *;"
      }
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return res.status(200).json({
        success: true,
        data: data
      });
    })
    .catch((error) => {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    });
});
const getIGDBGameCover = asyncErrorWrapper(async (req, res, next) => {
  const { coverId } = req.params;
  fetch(`https://api.igdb.com/v4/covers/${coverId}?fields=*`, {
    method: "GET",
    headers: {
      "Client-ID": "l4pr55lt0ezaizlm7ug9sat0s5zorp",
      Authorization: `Bearer xtc36j138h3pk0wxl3z53r27a7rrxt`,
      "Content-Type": "application/json",
      Body: "fields *;"
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return res.status(200).json({
        success: true,
        data: data
      });
    })
    .catch((error) => {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    });
});

module.exports = {
  getIGDBGames,
  getIGDBGameCover
};
