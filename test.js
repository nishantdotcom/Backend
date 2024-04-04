const express = require("express");
const app = express();
const z = require("zod");
const mongoose = require("mongoose");
const secretToken = "12345abcd";
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
app.use(express.json());

const uri =
  "mongodb+srv://nishantsingh1308:NDXPgk2AYEhywwgF@cluster0.mxja5fy.mongodb.net/User_app?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connection sucessfull");
  })
  .catch((err) => {
    console.log(err);
  });

const newUserSchema = new Schema({
  username: String,
  email: String,
  password: String,
});

const usersmodal = mongoose.model("users", newUserSchema);

const schema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
});
const loginSchema = app.get("/", (req, res) => {
  res.send("Hello world");
});
app.post("/signin", async (req, res) => {
  const validType = schema.safeParse(req.body);
  if (validType.success) {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const existemail = await usersmodal.findOne({
      email: email,
    });

    if (existemail) {
      res.status(403).send({
        message: "Email already Exist ,Please try different Email",
      });
    } else {
      const newToken = jwt.sign(
        { username: username, email: email },
        secretToken
      );
      console.log(newToken);
      const newUser = new usersmodal({
        email: email,
        username: username,
        password: password,
      });
      newUser.save();
      res.status(400).send({
        message: "Data updated sucessfull",
      });
    }
  } else {
    res.send(validType.error.issues[0].message);
  }
});
app.get("/login", async (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  const isUserExist = await usersmodal.findOne({
    username: username,
    password: password,
  });
  // console.log(isUserExist);
  if (isUserExist) {
    res.status(400).send("Login Sucessfull");
  } else {
    res.status(403).send("wrong login credentials");
  }
});

app.listen(5353, () => {
  console.log("listning on Port 5353");
});
