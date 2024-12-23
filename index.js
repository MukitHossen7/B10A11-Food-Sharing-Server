require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connection, client } = require("./DB/MongoDB");
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
connection();

//Middleware
app.use(cors());
app.use(express.json());

const foodCollection = client.db("foodSharingBD").collection("foods");
const requestedFoodCollection = client
  .db("foodSharingBD")
  .collection("requestFoods");

//post all add foods
app.post("/all-foods", async (req, res) => {
  const foods = req.body;
  const result = await foodCollection.insertOne(foods);
  res.send(result);
});

//post request foods
app.post("/request-foods", async (req, res) => {
  const foodRequest = req.body;
  const foodId = foodRequest.food_id;
  const result = await requestedFoodCollection.insertOne(foodRequest);
  const filter = { _id: new ObjectId(foodId) };
  const updateDoc = {
    $set: { status: foodRequest.status },
  };
  const updateResult = await foodCollection.updateOne(filter, updateDoc);
  res.send(result);
});
//get all food databases
app.get("/all-foods", async (req, res) => {
  const foods = await foodCollection
    .find({ status: "Available" })
    .sort({ expireDate: 1 })
    .toArray();
  res.send(foods);
});

//get single food database use id
app.get("/all-foods/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await foodCollection.findOne(query);
  res.send(result);
});
// app.get("/all-foods/:sortedFoods", async (req, res) => {
//   const sortType = parseInt(req.params.sortedFoods);
//   console.log(sortType);
//   const foods = await foodCollection
//     .find({ status: "Available" })
//     .sort({ expireDate: sortType })
//     .toArray();
//   res.send(foods);
// });
app.get("/", (req, res) => {
  res.send("Welcome to the Food sharing API!");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
