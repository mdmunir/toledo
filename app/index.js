const PORT = process.env.PORT || 4001;
const fs = require('fs');
const path = require('path');

var express = require('express');
const {createServer} = require("http");
const {Server} = require("socket.io");

var app = express();
var http = createServer(app);
const io = new Server(http, {
    cors: {origin: "*"},
});

const serial = require('./serial');
serial.on('error', console.log);

// endpoint
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.resolve(process.env.APP_DIR, 'public'),
        headers: {
            'content-type': 'text/html'
        }
    });
});

// ************
io.on('connection', function (socket) {
    serial.attach(socket);
});

http.listen(PORT, function () {
    console.log('listening on *:' + PORT);
});