const express = require("express");
const cors = require("cors");
const dbConnection = require("./config/dbConfig");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 1111;

app.listen(port, () => {
  console.log("Server started at PORT :", port);
});

dbConnection();
const errorHandler = require("./middleware/errorHandling");
app.use(errorHandler);

app.use(cors());
app.use(express.json());
app.use("/api/signupLoginRouter", require("./routers/signupLoginRouter"));

const products = require("./controllers/products");
app.get("/api/products", (req, res) => {
  res.send(products);
});
