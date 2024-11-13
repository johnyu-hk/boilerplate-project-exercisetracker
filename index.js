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

//create user and exercise schema
const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [exerciseSchema],
});
let users = mongoose.model("users", userSchema);
let exercises = mongoose.model("exercises", exerciseSchema);

// Express
app.use(cors());
// app.use(express.static("/public"));
app.use(express.static(__dirname + "/public"));

const bodyParser = require("body-parser");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", function (req, res) {
  //check if user exist
  console.log("input user name", req.body.username);
  users.findOne({ username: req.body.username }).then((data) => {
    // check if user exist
    console.log("if user exist", data);
    if (!data) {
      //create user when it is not exist
      users.create({ username: req.body.username }).then((data) => {
        console.log("created user is ", data);
        return res.json({ username: data.username, _id: data._id });
      });
    } else {
      console.log("user is ", data);
      return res.json({ username: data.username, _id: data._id });
    }
  });
});

app.get("/api/users", (req, res) => {
  users.find({}).then((result) => {
    res.json(
      result.map((data) => {
        return { username: data.username, _id: data._id };
      })
    );
  });
});

app.post(
  "/api/users/:_id/exercises",
  bodyParser.urlencoded({ extended: false }),
  function (req, res) {
    let newExerciseRecord = new exercises({
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: new Date(req.body.date || Date.now()).toDateString(),
    });
    users
      .findByIdAndUpdate(
        req.params._id,
        { $push: { log: newExerciseRecord } },
        { new: true }
      )
      .then((result) => {
        console.log(result);
        let resObject = {};
        resObject["_id"] = result._id;
        resObject["username"] = result.username;
        resObject["description"] = newExerciseRecord.description;
        resObject["duration"] = newExerciseRecord.duration;
        resObject["date"] = newExerciseRecord.date;
        res.json(resObject);
      })
      .catch((err) => {
        console.error(err);
      });
  }
);

// app.get("/api/users/:_id/logs", (req, res) => {
//   users
//     .findById(req.params._id)
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });
app.get("/api/users/:_id/logs/", (req, res) => {
  users
    .findById(req.params._id)
    .then((data) => {
      console.log(data.log.length);
      //check query from and to
      if (req.query.from || req.query.to) {
        let fromDate = new Date(0);
        let toDate = new Date();
        if (req.query.from) {
          fromDate = new Date(req.query.from);
        }
        if (req.query.to) {
          toDate = new Date(req.query.to);
        }
        data.log = data.log.filter((exercise) => {
          let exerciseDate = new Date(exercise.date).getTime();
          return (
            exerciseDate >= fromDate.getTime() &&
            exerciseDate <= toDate.getTime()
          );
        });
      }
      //check query limit
      if (req.query.limit) {
        data.log = data.log.slice(0, req.query.limit);
      }
      //count the result
      data._doc.count = data.log.length;
      console.log(Object.keys(data));
      console.log(Object.values(data));
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
