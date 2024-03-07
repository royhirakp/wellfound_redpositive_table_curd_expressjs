const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const cors = require("cors");
const connectDB = require("./db/db");
app.use(express.json());
//.env and cors
require("dotenv/config");
app.use(cors());
//connect db
connectDB();
//ROUTES
const ItemRoute = require("./controllers/ItemController");
app.use("/api/v1", ItemRoute);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "worong url! 404 not found",
  });
});

module.exports = app;
