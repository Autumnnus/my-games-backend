const multer = require("multer");

//? Local
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()  }-${  file.originalname}`);
//   }
// });

//?AWS S3
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;
