const express = require('express');
const app = express();
//to use tokens.
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
// const net = require('net');
//
// const https = require('https');
// const fs = require('fs');


const SOCKET_PORT = 9090;
const API_PORT = process.env.PORT || 3000;

const utils = require('./utils')

utils.sendSMS("0524289665","hi");
//utils.sendEmail("hodaiaefergan@gmail.com","hi")
// HTTPS
/*let key = fs.readFileSync(__dirname + '/certs/selfsigned.key');
let cert = fs.readFileSync(__dirname + '/certs/selfsigned.crt');
let options = {
    key: key,
    cert: cert
};*/


//to use mongodb
const mongoose = require('mongoose');
// mongodb+srv://admin:<password>@g-tag-930.l1iqv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
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

// let server = https.createServer(options, app);
// server.listen(API_PORT, () => console.log(`http server is listening on port ${API_PORT}`));
app.listen(API_PORT, () => console.log(`http server is listening on port ${API_PORT}`));




