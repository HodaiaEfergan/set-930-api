const express = require('express');
const app = express();
//to use tokens.
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const net = require('net');

const SOCKET_PORT = 9090;
const API_PORT = process.env.PORT || 3001;


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


app.listen(API_PORT, () => console.log(`http server is listening on port ${API_PORT}`));


/******************       SOCKET SERVER         **********************/

let server = net.createServer(function (socket) {
    console.log('client connected');
    // socket.write('Echo server\r\n');
    socket.pipe(socket);

    socket.on('end', function () {
        console.log('client disconnected');
    });

    socket.on('data', function (data) {
        let str = data.toString();
        console.log('data came in', str);

        if (str.toLowerCase().startsWith('uid')) {
            console.log('sample came in');
            return;
        }


        if (str.toLowerCase() === 'send configuration') {
            console.log('unit want to check for configuration');
            socket.emit('new config');
            return;
        }

        console.log('invalid data');

    });

    socket.on('error', function (error) {
        console.error(error);

    });

    socket.on('close', function () {
        console.info('Socket close');
    });
});

server.listen(SOCKET_PORT, () => {
    console.log('socket server is listening on port ' + SOCKET_PORT);
});


app.use('/', express.static('./public/g-tag-manager'));


