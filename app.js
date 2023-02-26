const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const bodyParser = require('body-parser');


app.use(fileUpload());

const DB_URL = 'mongodb+srv://thijmen:1234@social-media.m9iei1k.mongodb.net/test';

mongoose.set('strictQuery', false);

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Failed to connect to MongoDB', err);
});

const db = mongoose.connection;

app.use(bodyParser.json());
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(express.json({limit: '200mb'}));
app.use(express.text({ limit: '200mb' }));
app.use(cookieParser())
app.use(session({ secret: "twethwethbternhj" }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  next();
});


// fixing "413 Request Entity Too Large" errors


// file upload api

const User = require('./models/user');


// Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const profileRoutes = require('./routes/profile');
app.use('/profile', profileRoutes);

const messagesRoutes = require('./routes/messages');
app.use('/messages', messagesRoutes);

const followRoutes = require('./routes/follow');
app.use('/follow', followRoutes);
const mediaRoutes = require('./routes/media');
app.use('/media', mediaRoutes);




const devRoutes = require('./routes/dev');
app.use('/dev', devRoutes);

app.set('view engine', 'ejs')


process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  process.exit(1);
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});