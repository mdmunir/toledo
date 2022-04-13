const PORT = process.env.PORT || 4001;
const fs = require('fs');
const path = require('path');

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});
const serial = require('./serial');

// endpoint
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.resolve(__dirname, '../public'),
        headers: {
            'content-type': 'text/html'
        }
    });
});

// ************
io.on('connection', function (socket) {
    socket.emit('config', serial.config());
    socket.emit('value', serial.value());
    socket.on('config', value => serial.config(value));

    const handlers = {};
    const events = ['raw', 'segment', 'value', 'config'];
    events.forEach(name => {
        handlers[name] = function (data) {
            socket.emit(name, data);
        }

        serial.on(name, handlers[name]);
    });

    socket.on('disconnect', () => {
        events.forEach(name => serial.off(name, handlers[name]));
    });
});

http.listen(PORT, function () {
    console.log('listening on *:' + PORT);
});