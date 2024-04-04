const express = require("express");
const zod = require("zod");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const jsonsecret = "abdie1334nsdf";
const Schema = mongoose.Schema;

// as middleware
app.use(express.json());

const loginSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
  email: zod.string(),
});

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
});

const uri =
  "mongodb+srv://nishantsingh1308:NDXPgk2AYEhywwgF@cluster0.mxja5fy.mongodb.net/User_app?retryWrites=true&w=majority&appName=Cluster0";

const usersmodal = mongoose.model("users", userSchema);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Error in connecting DB");
  });

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.post("/signup", async (req, res) => {
  const getUserDetail = req.body;
  const response = loginSchema.safeParse(getUserDetail);
  if (response.success) {
    const username = response.data.username;
    const password = response.data.password;
    const email = response.data.email;
    const existemail = await usersmodal.findOne({
      email: email,
    });
    console.log(existemail);
    if (existemail) {
      console.log("email already exist");
      return res.status(403).send("User already exist");
    } else {
      console.log("New user");
      var token = jwt.sign({ username: username }, jsonsecret);
      console.log(token);
      const user = new usersmodal({
        username: username,
        email: email,
        password: password,
      });
      user.save();

      return res.status(200).send({
        message: "SIgn In sucessfull, please login",
        token: token,
      });
    }
  }
});

app.get("/users", (req, res) => {
  const authorization = req.headers.authorization;
  try {
    const response = jwt.verify(authorization, jsonsecret);
    const username = response.username;
    console.log(username);
    res.status(200).send({
      message: "verified",
      data: USER_LIST,
    });
  } catch (err) {
    res.status(403).send({
      message: "INvalid Token",
    });
  }
});

app.listen(3000, () => {
  console.log("Listning on port 3000");
});
