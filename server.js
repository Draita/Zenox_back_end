require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

const bodyParser = require('body-parser');

app.use(bodyParser.json());
//ALLOW cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});




mongoose.set('strictQuery', false);

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})

///console log stuff about the database
const db = mongoose.connection
db.on("error",  (error) => console.error(error))
db.once("open", () => console.log("connected to database"))


// Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const subscriberRouter = require('./routes/subscribers')
app.use('/subscribers', subscriberRouter)




app.listen(3000, () => {
  console.log('Server started on port 3000');
})



