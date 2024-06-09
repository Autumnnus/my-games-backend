const express = require("express");
const routers = require("./routes/index");
const connectDatabase = require("./db/conn");
const dotenv = require("dotenv");
const cors = require("cors");
const upload = require("./helpers/functions/multer");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
connectDatabase();
app.use(cors());
app.use(express.json());

app.use("/api", routers);
app.post('/upload', upload.single('file'), (req, res) => {
  // Handle the uploaded file
  res.json({ message: 'File uploaded successfully!' });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
