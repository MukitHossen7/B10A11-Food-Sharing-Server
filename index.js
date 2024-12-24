require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { connection, client } = require("./DB/MongoDB");
const { compareAsc, compareDesc } = require("date-fns");
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
connection();

//Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://food-sharing-bddd1.web.app",
      "https://food-sharing-bddd1.firebaseapp.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());

//Custom middleware

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

const foodCollection = client.db("foodSharingBD").collection("foods");
const requestedFoodCollection = client
  .db("foodSharingBD")
  .collection("requestFoods");

//Create token use jwt
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});

app.post("/logout", async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});

//post all add foods
app.post("/all-foods", verifyToken, async (req, res) => {
  const foods = req.body;
  const result = await foodCollection.insertOne(foods);
  res.send(result);
});

//post request foods
app.post("/request-foods", verifyToken, async (req, res) => {
  const foodRequest = req.body;
  if (req.user.email !== foodRequest.user_email) {
    return res.status(401).send({ message: "Unauthorized" });
  }
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

  try {
    const foods = await foodCollection.find(query).toArray();
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

//get Featured food data databases by hight quantity
app.get("/featured-foods", async (req, res) => {
  const foods = await foodCollection
    .find({ status: "Available" })
    .sort({ foodQuantity: -1 })
    .limit(6)
    .toArray();
  res.send(foods);
});
//delete all food databases
app.delete("/all-foods/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await foodCollection.deleteOne(filter);
  res.send(result);
});
app.patch("/all-foods/:id", verifyToken, async (req, res) => {
  const food = req.body;
  const id = req.params.id;
  console.log("updated", id);
  console.log("verified email", req.user.email);
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
app.get("/manage-my-foods", verifyToken, async (req, res) => {
  const email = req.query.email;
  if (req.user.email !== email) {
    return res.status(403).send({ message: "Forbidden" });
  }
  const query = { "donator.donatorEmail": email };
  const result = await foodCollection.find(query).sort({ _id: -1 }).toArray();
  res.send(result);
});

// get requested food by login user email
app.get("/request-foods", verifyToken, async (req, res) => {
  const email = req.query.email;
  if (req.user.email !== email) {
    return res.status(403).send({ message: "Forbidden" });
  }
  const result = await requestedFoodCollection
    .find({ user_email: email })
    .toArray();
  res.send(result);
});
//get single food database use id
app.get("/all-foods/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await foodCollection.findOne(query);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Welcome to the Food sharing API!");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
