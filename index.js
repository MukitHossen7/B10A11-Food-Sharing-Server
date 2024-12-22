require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connection, client } = require("./DB/MongoDB");
const app = express();
const port = process.env.PORT || 5000;
connection();

//Middleware
app.use(cors());
app.use(express.json());

const foodCollection = client.db("foodSharingBD").collection("foods");

app.post("/all-foods", async (req, res) => {
  const foods = req.body;
  const result = await foodCollection.insertOne(foods);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Welcome to the Food sharing API!");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
