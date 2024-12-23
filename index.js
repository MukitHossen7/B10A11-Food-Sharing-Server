require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connection, client } = require("./DB/MongoDB");
const { compareAsc, compareDesc } = require("date-fns");
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

app.get("/all-foods", async (req, res) => {
  const { available, search, sort } = req.query;

  let query = {};

  if (available) {
    query.status = "Available";
  }

  if (search) {
    query.foodName = { $regex: search, $options: "i" };
  }

  let sortOrder = {};
  if (sort === "asc") {
    sortOrder = {
      expireDate: 1,
    };
  } else if (sort === "dsc") {
    sortOrder = {
      expireDate: -1,
    };
  }

  try {
    const foods = await foodCollection.find(query).sort(sortOrder).toArray();
    if (sort === "asc") {
      foods.sort((a, b) =>
        compareAsc(new Date(a.expireDate), new Date(b.expireDate))
      );
    } else if (sort === "dsc") {
      foods.sort((a, b) =>
        compareDesc(new Date(a.expireDate), new Date(b.expireDate))
      );
    }

    res.send(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).send({ message: "Error fetching foods" });
  }
});

//get all food data databases
app.get("/foods", async (req, res) => {
  const foods = await foodCollection.find().toArray();
  res.send(foods);
});
//delete all food databases
app.delete("/all-foods/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await foodCollection.deleteOne(filter);
  res.send(result);
});
app.patch("/all-foods/:id", async (req, res) => {
  const food = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      foodName: food.foodName,
      foodImg: food.foodImg,
      foodQuantity: food.foodQuantity,
      location: food.location,
      expireDate: food.expireDate,
      additionalNotes: food.additionalNotes,
    },
  };
  const result = await foodCollection.updateOne(filter, updateDoc);
  res.send(result);
});

// manage my foods by login email
app.get("/manage-my-foods", async (req, res) => {
  const email = req.query.email;
  const query = { "donator.donatorEmail": email };
  const result = await foodCollection.find(query).sort({ _id: -1 }).toArray();
  res.send(result);
});

// get requested food by login user email
app.get("/request-foods", async (req, res) => {
  const email = req.query.email;
  const result = await requestedFoodCollection
    .find({ user_email: email })
    .toArray();
  res.send(result);
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
