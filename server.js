const express = require('express');
const app = express();
//to use tokens.
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
//to use mongodb
const mongoose = require('mongoose');
// mongodb+srv://admin:<password>@g-tag-930.l1iqv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
//test1
//from the atlas mongodb
const db = 'mongodb+srv://idan:koko1234@g-tag-930.l1iqv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

//connection to db and print "mongodb connected"
mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log('mongodb connected'))
    .catch(err => console.error(err));


// Middleware
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'})); // for parsing


// load controller
const apiCtrl = require('./routes/api');

// app.use('/', res.sendFile(index.html));
app.use('/api', apiCtrl);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`server is listening on port ${port}`));


