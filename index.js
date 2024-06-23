const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
const User = require('./models/user.model.js');
const Exercise = require('./models/exercise.model.js');
//const res = require('express/lib/response.js');

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Get all users info
app.get('/api/users', async (req,res) => {
  const users = await User.find({}).select("_id username");
  if (!users){
    res.send("No users");
  } else {
    res.json(users);
  }
});


// Create new user into Database
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crate new exercise tracker
app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const { description, duration, date } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      res.send("Could not find user");
    } else {
      const excerciseObj = new Exercise({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      })
      const exercise = await excerciseObj.save();
      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
      });
    }
  } catch (error) {
    console.log(error);
    res.send("There was an error saving the exercise");
  }
});

// Get user logs
app.get('/api/users/:id/logs', async (req,res) => {
  const { from, to , limit } = req.query;
  const { id } = req.params;
  const user = await User.findById(id);
  
  if(!user){
    res.send("Could not find user")
    return;
  }

  let dateObj = {}
  if(from){
    dateObj["$gte"] = new Date(from)
  }
  if(to){
    dateObj["$lte"] = new Date(to)
  }
  let filter = {
    user_id: id
  }
  if(from || to){
    filter.date = dateObj;
  }
  const exercises = await Exercise.find(filter).limit(+limit ?? 500);
  const log = exercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }))

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log
  });


});


// Database Location  
MONGO_URI = 'mongodb+srv://<user>:<password>@backenddb.vgtoqfs.mongodb.net/<collection_name>?retryWrites=true&w=majority&appName=BackendDB';

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to database!");

    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })
  })
  .catch(() => {
    console.log("Connection failed!");
  });


