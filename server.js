require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');






mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
///console log stuff about the database
const db = mongoose.connection


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(session({secret: "twethwethbternhj"}))


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});



// Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

app.set('view engine', 'ejs')
// require('./utilities/filelist')



app.listen(3000, () => {
  console.log('Server started on port 3000');
})


