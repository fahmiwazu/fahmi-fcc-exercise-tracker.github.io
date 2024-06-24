const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
const userRoute = require('./route/user.route.js');

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// user route
app.use("/api/users/", userRoute);

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


