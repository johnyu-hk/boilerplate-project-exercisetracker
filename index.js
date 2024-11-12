const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// MongoDB
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new Schema({
  username: { type: String, required: true },
});
const users = mongoose.model("users", userSchema);

const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: String, //"Mon Jan 01 1990",
  date: String,
});
const exercises = mongoose.model("exercises", exerciseSchema);

const logSchema = new Schema({
  username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});
const logs = mongoose.model("logs", logSchema);

// Express
app.use(cors());
// app.use(express.static("/public"));
// app.use("/public", express.static(__dirname + "/public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false })).use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/views/index.html");
// });

app.get("/api/users/:username", function (req, res) {
  console.log(req.params);
  //check if user exist
  // console.log(req.body.username)

  // console.log("input user name", req.body.username);
  // users.find({ username: req.body.username })
  //   .then(data => {
  //     // check if user exist
  //     console.log("if user exist",data)
  //     // if (!data) {
  //     //   //create user when it is not exist
  //     //   users.inserOne({ username: req.body.username })
  //     //   .then(data => {
  //     //     console.log("created user is ", data)
  //     //     return res.json(
  //     //       {"username":data.username,"_id":data._id}
  //     //     )
  //     //     })
  //     // } else {
  //     //   console.log("user is ", data)
  //     //   return res.json(
  //     //     {"username":data.username,"_id":data._id}
  //     //   )
  //     // }
  //     })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
